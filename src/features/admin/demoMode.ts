/**
 * One switch controls whether the admin demo login and mock dashboard are shown.
 *
 * Local development defaults to enabled for convenience.
 * Production builds default to disabled unless explicitly opted in.
 * Never use this flag as an authorization mechanism; real admin access must be
 * authenticated and authorized by the server.
 */
export const ADMIN_DEMO_MODE =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN_DEMO_DATA === 'true';
