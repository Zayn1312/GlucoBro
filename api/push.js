const https = require('https');

const SUPA_URL = process.env.SUPABASE_HOST || 'hvcuspxmswhlzkatfxst.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Y3VzcHhtc3dobHprYXRmeHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODUwODMsImV4cCI6MjA4ODc2MTA4M30.MiV1Fdrz3dT-BLTxH_d0SPqiLtMxU-87Af6u_ql95NU';
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || 'BMnd8AVzWEo7wily_Bqf5QNsFJ3O4SYuznPzrKeob786eyBfZTdddJuqM7XKNeB_9uFebqUxaogsXwO7dPkop3o';

function supaRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: SUPA_URL, path: '/rest/v1/' + path, method,
      headers: {
        'apikey': SUPA_KEY, 'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'resolution=merge-duplicates' : ''
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET: return VAPID public key
  if (req.method === 'GET') {
    return res.status(200).json({ publicKey: VAPID_PUBLIC });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, syncId, subscription } = req.body || {};

  if (action === 'subscribe') {
    if (!syncId || !subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'syncId and subscription required' });
    }
    // Upsert subscription to Supabase
    const payload = {
      sync_id: syncId,
      endpoint: subscription.endpoint,
      keys_p256dh: subscription.keys.p256dh,
      keys_auth: subscription.keys.auth
    };
    await supaRequest('POST', 'push_subscriptions?on_conflict=endpoint', payload);
    return res.status(200).json({ ok: true });
  }

  if (action === 'unsubscribe') {
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'subscription required' });
    }
    await supaRequest('DELETE', `push_subscriptions?endpoint=eq.${encodeURIComponent(subscription.endpoint)}`);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Unknown action. Use: subscribe, unsubscribe' });
};
