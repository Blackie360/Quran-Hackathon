const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const envFile = path.join(repoRoot, '.env');
const outputFile = path.join(repoRoot, 'public', 'env.js');

let env = {
  NG_APP_GEMINI_API_KEY: '',
  NG_APP_GEMINI_MODEL_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent'
};

if (fs.existsSync(envFile)) {
  const contents = fs.readFileSync(envFile, 'utf8');
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

    env[key] = value;
  });
}

env.NG_APP_GEMINI_API_KEY = process.env.NG_APP_GEMINI_API_KEY || env.NG_APP_GEMINI_API_KEY;
env.NG_APP_GEMINI_MODEL_URL = process.env.NG_APP_GEMINI_MODEL_URL || env.NG_APP_GEMINI_MODEL_URL;

const fileContents = `window.__env = ${JSON.stringify(env, null, 2)};\n`;
fs.writeFileSync(outputFile, fileContents, 'utf8');
console.log(`Generated ${path.relative(repoRoot, outputFile)}`);
