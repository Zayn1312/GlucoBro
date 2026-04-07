const crypto = require('crypto');
const https = require('https');
const zlib = require('zlib');

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
  'version': '4.12.0',
  'user-agent': 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
};

function httpsRequest(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname, path, method, headers };
    const req = https.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        const encoding = res.headers['content-encoding'];

        function parseBody(buf) {
          const str = buf.toString();
          try { return JSON.parse(str); }
          catch { return { raw: str, statusCode: res.statusCode }; }
        }

        if (encoding === 'gzip') {
          zlib.gunzip(raw, (err, decoded) => {
            if (err) resolve(parseBody(raw));
            else resolve(parseBody(decoded));
          });
        } else {
          resolve(parseBody(raw));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function login(email, password, host = 'api-eu.libreview.io') {
  const res = await httpsRequest(host, '/llu/auth/login', 'POST', LLU_HEADERS, { email, password });

  // Region redirect
  if (res.data && res.data.redirect && res.data.region) {
    const newHost = REGION_URLS[res.data.region] || host;
    return login(email, password, newHost);
  }

  // Terms of use
  if (res.status === 4) {
    return { error: 'terms_of_use', message: 'Bitte öffne die LibreLinkUp App und akzeptiere die Nutzungsbedingungen.' };
  }

  // Auth failure
  if (res.status === 2) {
    return {
      error: 'auth_failed',
      message: 'Falsche Zugangsdaten. Nutze deine LibreLinkUp Login-Daten (nicht FreeStyle Libre App). Öffne zuerst die LibreLinkUp App und logge dich dort ein.',
      debug: { status: 2, host }
    };
  }

  if (res.status !== 0 || !res.data || !res.data.authTicket) {
    return {
      error: 'login_failed',
      message: 'Login fehlgeschlagen (Status: ' + res.status + ').',
      debug: { status: res.status, hasData: !!res.data, statusCode: res.statusCode || null, host }
    };
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
  const allowed = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowed);
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
