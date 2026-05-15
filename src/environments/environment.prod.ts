const runtimeEnvironment =
  (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const environment = {
  production: true,
  clientId: runtimeEnvironment['NG_APP_CLIENT_ID'] || '',
  clientSecret: runtimeEnvironment['NG_APP_CLIENT_SECRET'] || ''
};
