/**
 * Credential reader module.
 * Strictly adheres to guardrails: All API keys/credentials are read ONLY in files in repo-root api/ via process.env.
 */

export function getLtaAccountKey(): string | null {
  const key = process.env.LTA_ACCOUNT_KEY || process.env.LTA_DATAMALL_ACCOUNT_KEY || process.env.TRANSIT_API_KEY || process.env.ACCOUNT_KEY;
  if (!key || key.trim() === '' || key.startsWith('MY_')) {
    return null;
  }
  return key.trim();
}

export function getOneMapEmail(): string | null {
  const email = process.env.ONEMAP_EMAIL;
  if (!email || email.trim() === '' || email.startsWith('MY_')) {
    return null;
  }
  return email.trim();
}

export function getOneMapPassword(): string | null {
  const password = process.env.ONEMAP_PASSWORD;
  if (!password || password.trim() === '' || password.startsWith('MY_')) {
    return null;
  }
  return password.trim();
}

export function getOneMapDirectToken(): string | null {
  const token = process.env.ONEMAP_API_TOKEN || process.env.ONEMAP_TOKEN;
  if (!token || token.trim() === '' || token.startsWith('MY_')) {
    return null;
  }
  return token.trim();
}

export function getMapsApiKey(): string | null {
  const key = process.env.MAPS_API_KEY;
  if (!key || key.trim() === '' || key.startsWith('MY_')) {
    return null;
  }
  return key.trim();
}

export function isLtaConfigured(): boolean {
  return getLtaAccountKey() !== null;
}

export function isOneMapConfigured(): boolean {
  return (getOneMapEmail() !== null && getOneMapPassword() !== null) || getOneMapDirectToken() !== null;
}
