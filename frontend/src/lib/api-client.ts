import { API_URL } from './config';
import { tokenStore } from './token-store';

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean; // defaults to true
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    tokenStore.clear();
    return null;
  }
  const data = await res.json();
  tokenStore.setAccessToken(data.accessToken);
  // rotate stored refresh token too
  localStorage.setItem('mca_refresh_token', data.refreshToken);
  return data.accessToken;
}

/**
 * request — single seam for every HTTP call to the backend.
 * On a 401 (expired access token) it transparently refreshes once and
 * retries the original request, coalescing concurrent refresh attempts
 * behind a shared in-flight promise so simultaneous requests don't each
 * trigger their own refresh-token rotation race.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = tokenStore.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth) {
    if (!refreshInFlight) refreshInFlight = refreshAccessToken().finally(() => (refreshInFlight = null));
    const newToken = await refreshInFlight;
    if (newToken) res = await doFetch();
  }

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      /* no body */
    }
    let message = res.statusText;
    if (body && typeof body === 'object' && 'message' in body) {
      const raw = (body as { message: unknown }).message;
      message = Array.isArray(raw) ? raw.join(', ') : String(raw);
    }
    throw new ApiError(res.status, message, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
