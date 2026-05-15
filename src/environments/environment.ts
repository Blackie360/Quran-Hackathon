const runtimeEnvironment =
  (globalThis as typeof globalThis & { __env?: Record<string, string>; process?: { env?: Record<string, string | undefined> } }).__env ??
  (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const environment = {
  production: false,
  clientId: runtimeEnvironment['NG_APP_CLIENT_ID'] || '',
  clientSecret: runtimeEnvironment['NG_APP_CLIENT_SECRET'] || '',
  geminiApiKey: runtimeEnvironment['NG_APP_GEMINI_API_KEY'] || '',
  geminiModelUrl:
    runtimeEnvironment['NG_APP_GEMINI_MODEL_URL'] ||
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent'
};
