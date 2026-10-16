/**
 * Central switch for the mock admin login and dashboard data.
 *
 * If VITE_ENABLE_ADMIN_DEMO_DATA is explicitly set, that value wins.
 * Otherwise demos are enabled only during local Vite development.
 *
 * This is a UI/build flag, NOT an authorization boundary. Real admin access
 * must be authenticated and authorized on the server.
 */
const configuredDemoFlag = import.meta.env.VITE_ENABLE_ADMIN_DEMO_DATA;

export const ADMIN_DEMO_MODE =
  configuredDemoFlag === undefined
    ? import.meta.env.DEV
    : configuredDemoFlag === 'true';
