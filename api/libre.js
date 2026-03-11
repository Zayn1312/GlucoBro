const crypto = require('crypto');
const https = require('https');

const REGION_URLS = {
  EU: 'api-eu.libreview.io', DE: 'api-de.libreview.io', FR: 'api-fr.libreview.io',
  US: 'api.libreview.io', CA: 'api-ca.libreview.io', AU: 'api-au.libreview.io',
  AE: 'api-ae.libreview.io', AP: 'api-ap.libreview.io', JP: 'api-jp.libreview.io',
  EU2: 'api-eu2.libreview.io', LA: 'api-la.libreview.io',
};

const LLU_HEADERS = {
  'accept-encoding': 'gzip',
  'cache-control': 'no-cache',
  'connection': 'Keep-Alive',
  'content-type': 'application/json',
  'product': 'llu.android',
  'version': '4.16.0',
};

function httpsRequest(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname, path, method, headers };
    const req = https.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch { resolve({ raw: Buffer.concat(chunks).toString(), statusCode: res.statusCode }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function login(email, password, host = 'api-eu.libreview.io') {
  const res = await httpsRequest(host, '/llu/auth/login', 'POST', LLU_HEADERS, { email, password });

  if (res.data && res.data.redirect && res.data.region) {
    const newHost = REGION_URLS[res.data.region] || host;
    return login(email, password, newHost);
  }

  if (res.status === 4) {
    return { error: 'terms_of_use', message: 'Bitte öffne die LibreLinkUp App und akzeptiere die Nutzungsbedingungen.' };
  }

  if (res.status !== 0 || !res.data || !res.data.authTicket) {
    return { error: 'login_failed', message: 'Login fehlgeschlagen. Prüfe E-Mail und Passwort.', raw: res };
  }

  const token = res.data.authTicket.token;
  const accountId = crypto.createHash('sha256').update(res.data.user.id).digest('hex');
  return { token, accountId, host };
}

async function getConnections(token, accountId, host) {
  const headers = { ...LLU_HEADERS, authorization: `Bearer ${token}`, 'account-id': accountId };
  return httpsRequest(host, '/llu/connections', 'GET', headers);
}

async function getGraph(patientId, token, accountId, host) {
  const headers = { ...LLU_HEADERS, authorization: `Bearer ${token}`, 'account-id': accountId };
  return httpsRequest(host, `/llu/connections/${patientId}/graph`, 'GET', headers);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action, email, password, token, accountId, host, patientId } = req.body || {};

  try {
    if (action === 'login') {
      if (!email || !password) return res.status(400).json({ error: 'Email und Passwort erforderlich' });
      const result = await login(email, password);
      return res.status(result.error ? 400 : 200).json(result);
    }

    if (action === 'connections') {
      if (!token || !accountId || !host) return res.status(400).json({ error: 'Auth-Daten fehlen' });
      const result = await getConnections(token, accountId, host);
      return res.status(200).json(result);
    }

    if (action === 'graph') {
      if (!token || !accountId || !host || !patientId) return res.status(400).json({ error: 'Parameter fehlen' });
      const result = await getGraph(patientId, token, accountId, host);
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: 'Unbekannte Action. Nutze: login, connections, graph' });
  } catch (err) {
    return res.status(500).json({ error: 'Server-Fehler', message: err.message });
  }
};
