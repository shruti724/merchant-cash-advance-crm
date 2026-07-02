/**
 * TokenStore — thin wrapper around localStorage for the two JWTs.
 * Centralized here so every other module reads/writes tokens through one
 * seam (easy to swap for httpOnly-cookie based storage later without
 * touching call sites).
 */
const ACCESS_KEY = 'mca_access_token';
const REFRESH_KEY = 'mca_refresh_token';
const USER_KEY = 'mca_user';

export const tokenStore = {
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  getUser<T>(): T | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  },
  setSession(accessToken: string, refreshToken: string, user: unknown) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  setAccessToken(accessToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
