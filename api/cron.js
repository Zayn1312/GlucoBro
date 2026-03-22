const webpush = require('web-push');
const https = require('https');
const crypto = require('crypto');
const zlib = require('zlib');

const SUPA_HOST = process.env.SUPABASE_HOST || 'hvcuspxmswhlzkatfxst.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
if (!SUPA_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY env var required');

const LLU_HEADERS = {
  'accept-encoding': 'gzip',
  'cache-control': 'no-cache', 'connection': 'Keep-Alive',
  'content-type': 'application/json', 'product': 'llu.android', 'version': '4.12.0',
  'user-agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
};

const REGION_URLS = {
  EU: 'api-eu.libreview.io', DE: 'api-de.libreview.io', US: 'api.libreview.io',
  FR: 'api-fr.libreview.io', CA: 'api-ca.libreview.io', AU: 'api-au.libreview.io',
  EU2: 'api-eu2.libreview.io', AE: 'api-ae.libreview.io', AP: 'api-ap.libreview.io',
};

const ENC_KEY = process.env.CGM_ENCRYPTION_KEY; // 32-byte hex for AES-256-GCM

const BZ_HIGH = 180;
const BZ_LOW = 70;
const TREND_ARROWS = { 1: '↓↓', 2: '↓', 3: '→', 4: '↑', 5: '↑↑' };

function decryptField(data, keyHex) {
  if (!keyHex || !data || !data.includes(':')) return data; // unencrypted fallback
  try {
    const [ivHex, encHex, tagHex] = data.split(':');
    const key = Buffer.from(keyHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return decipher.update(Buffer.from(encHex, 'hex'), null, 'utf8') + decipher.final('utf8');
  } catch { return data; } // fallback to raw value if not encrypted
}

function httpsReq(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method, headers }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        const encoding = res.headers['content-encoding'];

        function parse(buf) {
          try { return JSON.parse(buf.toString()); }
          catch { return null; }
        }

        if (encoding === 'gzip') {
          zlib.gunzip(raw, (err, decoded) => {
            resolve(err ? parse(raw) : parse(decoded));
          });
        } else {
          resolve(parse(raw));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function supaGet(path) {
  return httpsReq(SUPA_HOST, '/rest/v1/' + path, 'GET', {
    'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY, 'Accept': 'application/json'
  });
}

async function lluLogin(email, password, host = 'api-eu.libreview.io') {
  const res = await httpsReq(host, '/llu/auth/login', 'POST', LLU_HEADERS, { email, password });
  if (res?.data?.redirect && res.data.region) {
    return lluLogin(email, password, REGION_URLS[res.data.region] || host);
  }
  if (res?.status !== 0 || !res?.data?.authTicket) return null;
  return {
    token: res.data.authTicket.token,
    accountId: crypto.createHash('sha256').update(res.data.user.id).digest('hex'),
    host
  };
}

async function lluGetCurrent(token, accountId, host) {
  const headers = { ...LLU_HEADERS, authorization: `Bearer ${token}`, 'account-id': accountId };
  const conns = await httpsReq(host, '/llu/connections', 'GET', headers);
  if (!conns?.data?.length) return null;
  const patient = conns.data[0];
  return patient.glucoseMeasurement || null;
}

module.exports = async function handler(req, res) {
  // Verify cron secret (Vercel or external cron service sends this)
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Get all CGM credentials from Supabase
    const cgmCreds = await supaGet('cgm_credentials?select=*');
    if (!cgmCreds?.length) return res.status(200).json({ message: 'No CGM credentials configured' });

    // Setup webpush
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:zayn@glucobro.app',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const results = [];

    for (const cred of cgmCreds) {
      const { sync_id } = cred;
      const email = decryptField(cred.email, ENC_KEY);
      const password = decryptField(cred.password, ENC_KEY);

      // Login to LibreLinkUp
      const auth = await lluLogin(email, password);
      if (!auth) { results.push({ sync_id, error: 'login_failed' }); continue; }

      // Get current reading
      const reading = await lluGetCurrent(auth.token, auth.accountId, auth.host);
      if (!reading) { results.push({ sync_id, error: 'no_reading' }); continue; }

      const bz = reading.ValueInMgPerDl || reading.Value;
      const trend = TREND_ARROWS[reading.TrendArrow] || '';
      results.push({ sync_id, bz, trend });

      // Check if alert needed
      const needsAlert = bz >= BZ_HIGH || bz <= BZ_LOW;
      if (!needsAlert) continue;

      // Get push subscriptions for this sync_id
      const subs = await supaGet(`push_subscriptions?sync_id=eq.${sync_id}&select=*`);
      if (!subs?.length) continue;

      const isHigh = bz >= BZ_HIGH;
      const title = isHigh ? `⚠️ BZ zu hoch: ${bz} mg/dl ${trend}` : `🔴 BZ zu niedrig: ${bz} mg/dl ${trend}`;
      const body = isHigh
        ? 'Bewegung, Wasser trinken. Du packst das.'
        : 'Schnell Zucker zuführen! Traubenzucker, Saft.';

      // Dual-format: standard (SW reads) + Declarative Web Push (iOS 18.4+ fallback)
      const payload = JSON.stringify({
        web_push: 8030,
        notification: { title, body, navigate: '/GlucoBro.html', app_badge: 1 },
        title, body, bz, trend, url: '/GlucoBro.html'
      });

      for (const sub of subs) {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: { p256dh: sub.keys_p256dh, auth: sub.keys_auth }
          }, payload);
        } catch (err) {
          // Remove expired/invalid subscriptions
          if (err.statusCode === 410 || err.statusCode === 404) {
            await httpsReq(SUPA_HOST, `/rest/v1/push_subscriptions?id=eq.${sub.id}`, 'DELETE', {
              'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY
            });
          }
        }
      }
    }

    return res.status(200).json({ ok: true, results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
