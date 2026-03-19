const webpush = require('web-push');
const https = require('https');
const crypto = require('crypto');

const SUPA_HOST = 'hvcuspxmswhlzkatfxst.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Y3VzcHhtc3dobHprYXRmeHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODUwODMsImV4cCI6MjA4ODc2MTA4M30.MiV1Fdrz3dT-BLTxH_d0SPqiLtMxU-87Af6u_ql95NU';

const LLU_HEADERS = {
  'cache-control': 'no-cache', 'connection': 'Keep-Alive',
  'content-type': 'application/json', 'product': 'llu.ios', 'version': '4.16.0',
  'user-agent': 'Mozilla/5.0 (iPhone; CPU OS 17_4_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/17.4.1 Mobile/10A5355d Safari/8536.25',
};

const REGION_URLS = {
  EU: 'api-eu.libreview.io', DE: 'api-de.libreview.io', US: 'api.libreview.io',
  FR: 'api-fr.libreview.io', CA: 'api-ca.libreview.io', AU: 'api-au.libreview.io',
  EU2: 'api-eu2.libreview.io', AE: 'api-ae.libreview.io', AP: 'api-ap.libreview.io',
};

const BZ_HIGH = 180;
const BZ_LOW = 70;
const TREND_ARROWS = { 1: '↓↓', 2: '↓', 3: '→', 4: '↑', 5: '↑↑' };

function httpsReq(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method, headers }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch { resolve(null); }
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
      const { sync_id, email, password } = cred;

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

      const payload = JSON.stringify({ title, body, bz, trend, url: '/GlucoBro.html' });

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
