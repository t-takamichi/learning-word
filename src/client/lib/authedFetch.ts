// Centralized authenticated fetch.
//
// Every authenticated data hook should call authedFetch instead of using raw
// fetch + a hand-rolled X-User-Token header. It does two things in one place:
//   1. Injects the stored user token on every request.
//   2. Handles 401 (invalid/expired token) by clearing the stored session and
//      sending the user back to the login screen (/users).
//
// This matters because tokens can be invalidated out-of-band (e.g. a DB reset),
// and without central handling the app would sit on a broken screen returning
// 401 forever, looking "just broken" to the user.

const AUTH_STORAGE_KEYS = [
  'active_user_id',
  'active_username',
  'active_user_token',
  'active_word_set_id',
] as const;

const LOGIN_PATH = '/users';

// Guards against several concurrent 401s (session + words + word-sets can all be
// in flight at once) each triggering their own navigation.
let redirecting = false;

/** Thrown on a 401 so callers/react-query settle into an error state instead of
 *  rendering stale data while the redirect happens. */
export class UnauthorizedError extends Error {
  constructor() {
    super('認証の有効期限が切れました。ログインし直してください。');
    this.name = 'UnauthorizedError';
  }
}

const forceLogout = (): void => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

  if (redirecting) return;
  redirecting = true;

  // A full navigation also discards stale in-memory React state, which is what
  // we want here since the active user is no longer valid.
  if (window.location.pathname !== LOGIN_PATH) {
    window.location.assign(LOGIN_PATH);
  }
};

export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token =
    typeof window === 'undefined' ? '' : localStorage.getItem('active_user_token') || '';

  const headers = new Headers(init.headers);
  headers.set('X-User-Token', token);

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    forceLogout();
    throw new UnauthorizedError();
  }

  return res;
}
