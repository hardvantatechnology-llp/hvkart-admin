// Pure redirect-decision logic for the admin proxy (src/proxy.js).
// Mirrors hardvanta/src/middleware.js's rule set exactly, adapted to this
// project's routes: protected prefix is /dashboard instead of /admin, and an
// already-authenticated ADMIN visiting /login is sent straight to /dashboard.
export const DASHBOARD_PREFIX = "/dashboard";
export const LOGIN_PATH = "/login";

/**
 * @param {{ pathname: string, token: { role?: string } | null }} params
 * @returns {{ redirect: string | null, withCallback?: boolean }}
 */
export function resolveAdminGate({ pathname, token }) {
  const isDashboardRoute = pathname === DASHBOARD_PREFIX || pathname.startsWith(`${DASHBOARD_PREFIX}/`);
  const isLoginRoute = pathname === LOGIN_PATH;

  const unauthenticated = !token;
  const notAdmin = token?.role !== "ADMIN";

  // Rule: not logged in (or logged in but not ADMIN) hitting a dashboard
  // route -> back to /login, same as hardvanta's /admin gate.
  if (isDashboardRoute && (unauthenticated || notAdmin)) {
    return { redirect: LOGIN_PATH, withCallback: true };
  }

  // Rule: already an authenticated ADMIN visiting /login -> skip straight to
  // the dashboard instead of showing the login form again.
  if (isLoginRoute && !unauthenticated && !notAdmin) {
    return { redirect: DASHBOARD_PREFIX };
  }

  return { redirect: null };
}
