import http from 'node:http';

const PORT = Number(process.env.PORT || 3001);
const CONTENT_API_BASE = 'https://api.quran.com/api/v4';
const AUTH_TOKEN_URL = 'https://oauth2.quran.foundation/oauth2/token';

function sendJson(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    ...headers
  });
  res.end(JSON.stringify(body));
}

function sendHtml(res, statusCode, body) {
  res.writeHead(statusCode, {
    'content-type': 'text/html; charset=utf-8'
  });
  res.end(body);
}

function stripHopByHopHeaders(headers) {
  const result = new Headers(headers);
  [
    'connection',
    'content-encoding',
    'content-length',
    'host',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade'
  ].forEach((header) => result.delete(header));
  return result;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function proxyContentApi(req, res, requestUrl) {
  const targetPath = requestUrl.pathname.replace(/^\/api\/content-api\/?/, '');
  const targetUrl = new URL(`${CONTENT_API_BASE}/${targetPath}`);
  targetUrl.search = requestUrl.search;

  const headers = stripHopByHopHeaders(req.headers);
  const init = {
    method: req.method,
    headers,
    redirect: 'manual'
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await readRequestBody(req);
  }

  const upstream = await fetch(targetUrl, init);
  const responseHeaders = stripHopByHopHeaders(upstream.headers);
  responseHeaders.set('x-proxied-by', 'quran-node-backend');

  res.writeHead(upstream.status, Object.fromEntries(responseHeaders));

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const body = Buffer.from(await upstream.arrayBuffer());
  res.end(body);
}

async function proxyAuthToken(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' }, { allow: 'POST' });
    return;
  }

  const headers = new Headers();
  const authorization = req.headers.authorization;

  if (authorization) {
    headers.set('authorization', authorization);
  }

  headers.set('content-type', req.headers['content-type'] || 'application/x-www-form-urlencoded');

  const upstream = await fetch(AUTH_TOKEN_URL, {
    method: 'POST',
    headers,
    body: await readRequestBody(req)
  });
  const responseHeaders = stripHopByHopHeaders(upstream.headers);
  responseHeaders.set('x-proxied-by', 'quran-node-backend');

  res.writeHead(upstream.status, Object.fromEntries(responseHeaders));
  const body = Buffer.from(await upstream.arrayBuffer());
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url || '/', `http://${req.headers.host || `localhost:${PORT}`}`);

    if (requestUrl.pathname === '/') {
      sendHtml(
        res,
        200,
        `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Quran Backend</title>
  </head>
  <body style="font-family: system-ui, sans-serif; padding: 2rem;">
    <h1>Quran Backend</h1>
    <p>Node.js backend proxy is running.</p>
    <p>Angular should proxy <code>/content-api</code> to <code>http://localhost:${PORT}/api</code>.</p>
  </body>
</html>`
      );
      return;
    }

    if (requestUrl.pathname === '/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (requestUrl.pathname === '/api/content-api' || requestUrl.pathname.startsWith('/api/content-api/')) {
      await proxyContentApi(req, res, requestUrl);
      return;
    }

    if (requestUrl.pathname === '/api/auth-api/oauth2/token') {
      await proxyAuthToken(req, res);
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Quran Node.js backend listening on http://localhost:${PORT}`);
});
