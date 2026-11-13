import { requireSupabaseConfig } from './supabaseConfig';

const SESSION_KEY = 'devcoder_cloud_session_v1';
type CloudUser = { id: string; email?: string };
interface TokenPayload {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: CloudUser;
}
type CloudSession = TokenPayload & { expires_at: number };

export async function supabaseRequest<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const { url, key } = requireSupabaseConfig();
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', 'Bearer ' + token);
  const response = await fetch(url + path, { ...init, headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload as { msg?: string; message?: string; error_description?: string } | null;
    throw new Error(error?.msg || error?.message || error?.error_description || 'Supabase error ' + response.status);
  }
  return payload as T;
}

function readSession(): CloudSession | null {
  try {
    const value = sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const session: CloudSession = JSON.parse(value);
    return session.access_token && session.refresh_token && session.user?.id ? session : null;
  } catch {
    return null;
  }
}

function saveSession(data: TokenPayload): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    ...data,
    expires_at: Date.now() + data.expires_in * 1000
  } satisfies CloudSession));
}

export async function cloudSignup(email: string, password: string): Promise<void> {
  if (password.length < 8) throw new Error('Use at least 8 password characters.');
  await supabaseRequest('/auth/v1/signup', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
  });
  // Verify your email before attempting sign-in when email confirmation is enabled.
}

export async function cloudLogin(email: string, password: string): Promise<CloudUser> {
  const session = await supabaseRequest<TokenPayload>('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password })
  });
  if (!session.access_token || !session.refresh_token || !session.user?.id) {
    throw new Error('Supabase did not issue a valid session.');
  }
  saveSession(session);
  return session.user;
}

export async function cloudAccessToken(): Promise<string> {
  const session = readSession();
  if (!session) throw new Error('Sign in to your cloud account first.');
  if (Date.now() < session.expires_at - 60000) return session.access_token;
  try {
    const renewed = await supabaseRequest<TokenPayload>('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: session.refresh_token })
    });
    saveSession(renewed);
    return renewed.access_token;
  } catch (error) {
    sessionStorage.removeItem(SESSION_KEY);
    throw error;
  }
}

export async function cloudAccount(): Promise<CloudUser | null> {
  if (!readSession()) return null;
  return supabaseRequest<CloudUser>('/auth/v1/user', {}, await cloudAccessToken());
}

export async function cloudLogout(): Promise<void> {
  try {
    if (readSession()) {
      await supabaseRequest('/auth/v1/logout', { method: 'POST' }, await cloudAccessToken());
    }
  } finally {
    sessionStorage.removeItem(SESSION_KEY);
  }
}
