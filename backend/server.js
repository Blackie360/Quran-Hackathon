import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadEnvFile(path.join(__dirname, '.env'));

const PORT = Number(process.env.PORT || 3001);
const CONTENT_API_BASE = 'https://api.quran.com/api/v4';
const AUTH_TOKEN_URL = 'https://oauth2.quran.foundation/oauth2/token';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL_URL =
  process.env.GEMINI_MODEL_URL ||
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)$/);
    if (!match) return;

    const key = match[1].trim();
    let value = match[2].trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

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

async function readJsonBody(req) {
  const body = await readRequestBody(req);

  if (!body.length) {
    return {};
  }

  try {
    return JSON.parse(body.toString('utf8'));
  } catch {
    const error = new Error('Invalid JSON request body');
    error.statusCode = 400;
    throw error;
  }
}

function buildInterpretationPrompt({ verseText, verseKey, translation }) {
  const translationText = translation ? `\n\nEnglish Translation:\n${translation}` : '';

  return `You are an Islamic scholar and Quran interpreter. Provide a comprehensive but concise interpretation of the following Quranic verse:

Verse Reference: ${verseKey}
Arabic Text: ${verseText}${translationText}

Please provide:
1. **Context**: Historical and contextual background
2. **Meaning**: Deep explanation of the verse's meaning
3. **Key Themes**: Main themes and concepts
4. **Spiritual Lesson**: What Muslims can learn from this verse
5. **Modern Application**: How this verse applies to contemporary life

Keep the response clear, respectful, and academically sound. Use simple language while maintaining depth.`;
}

function buildTranslationPrompt({ verseText, verseKey }) {
  return `Translate the following Quranic verse from Arabic to clear, faithful English.

Verse Reference: ${verseKey}
Arabic Text: ${verseText}

Requirements:
- Return only the English translation.
- Preserve the meaning as carefully as possible.
- Do not add tafsir, commentary, footnotes, headings, or markdown.
- Use respectful Quran translation style in plain modern English.`;
}

async function handleGeminiRequest(req, res, mode) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' }, { allow: 'POST' });
    return;
  }

  if (!GEMINI_API_KEY) {
    sendJson(res, 500, { error: 'Gemini API key is not configured on the backend.' });
    return;
  }

  const payload = await readJsonBody(req);
  const verseText = String(payload.verseText || '').trim();
  const verseKey = String(payload.verseKey || '').trim();
  const translation = String(payload.translation || '').trim();

  if (!verseText || !verseKey) {
    sendJson(res, 400, { error: 'verseText and verseKey are required.' });
    return;
  }

  const prompt = mode === 'translation'
    ? buildTranslationPrompt({ verseText, verseKey })
    : buildInterpretationPrompt({ verseText, verseKey, translation });

  const upstream = await fetch(`${GEMINI_MODEL_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    })
  });

  const body = await upstream.text();

  res.writeHead(upstream.status, {
    'content-type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
    'x-proxied-by': 'quran-node-backend'
  });
  res.end(body);
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

    if (requestUrl.pathname === '/api/ai-api/gemini/interpret') {
      await handleGeminiRequest(req, res, 'interpretation');
      return;
    }

    if (requestUrl.pathname === '/api/ai-api/gemini/translate') {
      await handleGeminiRequest(req, res, 'translation');
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error);
    sendJson(res, error.statusCode || 500, { error: error.message || 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Quran Node.js backend listening on http://localhost:${PORT}`);
});
