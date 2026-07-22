// Client-side "view mode" for admins browsing the store as a normal user.
// When set to "user", the storefront hides admin-only UI (the Admin link).
// Copied verbatim from hardvanta/src/lib/viewMode.js.
export const VIEW_KEY = "hardvanta_view_mode";

export function setUserView(on) {
  try {
    if (on) localStorage.setItem(VIEW_KEY, "user");
    else localStorage.removeItem(VIEW_KEY);
    // Notify components in the same tab (storage event only fires cross-tab).
    window.dispatchEvent(new Event("viewmodechange"));
  } catch {}
}

export function getUserView() {
  try {
    return localStorage.getItem(VIEW_KEY) === "user";
  } catch {
    return false;
  }
}
