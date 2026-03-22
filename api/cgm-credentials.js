const crypto = require('crypto');
const https = require('https');

const SUPA_HOST = process.env.SUPABASE_HOST || 'hvcuspxmswhlzkatfxst.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const ENC_KEY = process.env.CGM_ENCRYPTION_KEY; // 32-byte hex string

function encrypt(text, keyHex) {
  const key = Buffer.from(keyHex, 'hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + enc.toString('hex') + ':' + tag.toString('hex');
}

function decrypt(data, keyHex) {
  const [ivHex, encHex, tagHex] = data.split(':');
  const key = Buffer.from(keyHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
  return decipher.update(Buffer.from(encHex, 'hex'), null, 'utf8') + decipher.final('utf8');
}

function supaRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SUPA_HOST, path: '/rest/v1/' + path, method,
      headers: {
        'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=representation' : ''
      }
    };
    const req = https.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

module.exports = async function handler(req, res) {
  const allowed = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowed);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPA_KEY) return res.status(500).json({ error: 'Server misconfigured: missing SUPABASE_KEY' });
  if (!ENC_KEY) return res.status(500).json({ error: 'Server misconfigured: missing CGM_ENCRYPTION_KEY' });

  const { action, syncId, email, password } = req.body || {};

  if (!syncId) return res.status(400).json({ error: 'syncId required' });

  if (action === 'store') {
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const encEmail = encrypt(email, ENC_KEY);
    const encPassword = encrypt(password, ENC_KEY);

    await supaRequest('POST', 'cgm_credentials?on_conflict=sync_id', {
      sync_id: syncId,
      email: encEmail,
      password: encPassword
    });

    return res.status(200).json({ ok: true });
  }

  if (action === 'retrieve') {
    const rows = await supaRequest('GET', `cgm_credentials?sync_id=eq.${encodeURIComponent(syncId)}&select=email,password`);
    if (!Array.isArray(rows) || !rows.length) return res.status(404).json({ error: 'No credentials found' });

    try {
      const decEmail = decrypt(rows[0].email, ENC_KEY);
      const decPassword = decrypt(rows[0].password, ENC_KEY);
      return res.status(200).json({ email: decEmail, password: decPassword });
    } catch {
      return res.status(200).json({ email: rows[0].email, password: rows[0].password, encrypted: false });
    }
  }

  return res.status(400).json({ error: 'Unknown action. Use: store, retrieve' });
};
