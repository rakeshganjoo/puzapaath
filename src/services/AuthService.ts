import { Linking, Platform } from 'react-native';
import { getJSON, remove, setJSON } from './StorageService';

const AUTH_STORAGE_KEY = 'janthari_auth_session_v1';
const COGNITO_DOMAIN = process.env.EXPO_PUBLIC_COGNITO_DOMAIN || 'https://cwfriends-auth.auth.us-east-1.amazoncognito.com';
const COGNITO_CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '3dumhinotd2th14vfq4k33vd5q';

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthUser {
  userId: string;
  email: string;
  name?: string;
  picture?: string;
  provider?: string;
}

export interface AuthSession {
  tokens: AuthTokens;
  user: AuthUser;
}

function getRedirectUri(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'janthari://auth/callback';
}

function getSignOutUri(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'janthari://logout';
}

export function getGoogleLoginUrl(): string {
  const params = new URLSearchParams({
    identity_provider: 'Google',
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    client_id: COGNITO_CLIENT_ID,
    scope: 'openid email profile',
  });
  return `${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
}

export async function startGoogleSignIn(): Promise<void> {
  const loginUrl = getGoogleLoginUrl();
  await Linking.openURL(loginUrl);
}

async function exchangeCodeForTokens(code: string): Promise<AuthTokens> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: COGNITO_CLIENT_ID,
    code,
    redirect_uri: getRedirectUri(),
  });

  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: HTTP ${response.status}`);
  }

  const data = await response.json() as {
    access_token: string;
    id_token: string;
    refresh_token: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: COGNITO_CLIENT_ID,
    refresh_token: refreshToken,
  });

  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: HTTP ${response.status}`);
  }

  const data = await response.json() as {
    access_token: string;
    id_token: string;
    expires_in: number;
  };

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

async function fetchUserInfo(accessToken: string): Promise<AuthUser> {
  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/userInfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user info: HTTP ${response.status}`);
  }

  const data = await response.json() as {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    identities?: string;
  };

  return {
    userId: data.sub,
    email: data.email || '',
    name: data.name,
    picture: data.picture,
    provider: data.identities,
  };
}

export async function storeAuthSession(session: AuthSession): Promise<void> {
  await setJSON(AUTH_STORAGE_KEY, session);
}

export async function getStoredAuthSession(): Promise<AuthSession | null> {
  return getJSON<AuthSession>(AUTH_STORAGE_KEY);
}

export async function clearAuthSession(): Promise<void> {
  await remove(AUTH_STORAGE_KEY);
}

export async function getValidAuthSession(): Promise<AuthSession | null> {
  const existing = await getStoredAuthSession();
  if (!existing) return null;

  if (Date.now() < existing.tokens.expiresAt - 5 * 60 * 1000) {
    return existing;
  }

  try {
    const tokens = await refreshTokens(existing.tokens.refreshToken);
    const session = { ...existing, tokens };
    await storeAuthSession(session);
    return session;
  } catch {
    await clearAuthSession();
    return null;
  }
}

export async function getValidIdToken(): Promise<string | null> {
  const session = await getValidAuthSession();
  return session?.tokens.idToken ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getValidAuthSession();
  return session?.user ?? null;
}

function extractCodeFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('code');
  } catch {
    return null;
  }
}

export async function processAuthCallback(url: string): Promise<AuthSession | null> {
  const code = extractCodeFromUrl(url);
  if (!code) return null;

  const tokens = await exchangeCodeForTokens(code);
  const user = await fetchUserInfo(tokens.accessToken);
  const session = { tokens, user };
  await storeAuthSession(session);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  return session;
}

export async function processInitialAuthCallback(): Promise<AuthSession | null> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return processAuthCallback(window.location.href);
  }

  const initialUrl = await Linking.getInitialURL();
  if (!initialUrl) return null;
  return processAuthCallback(initialUrl);
}

export function getLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    logout_uri: getSignOutUri(),
  });
  return `${COGNITO_DOMAIN}/logout?${params.toString()}`;
}

export async function signOut(): Promise<void> {
  await clearAuthSession();
  await Linking.openURL(getLogoutUrl());
}
