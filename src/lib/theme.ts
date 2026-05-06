/**
 * Theme primitives shared between the anti-FOUC inline boot script
 * (src/app/layout.tsx) and the React-side controls (FloatingThemeToggle).
 *
 * The inline boot script intentionally does NOT import this file —
 * it has to run before any module graph is loaded. Keep the storage
 * key + dark-class semantics in sync between the two.
 */

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "vibebench:theme";
export const THEME_PREFERENCES: ThemePreference[] = ["system", "light", "dark"];

const isBrowser = () => typeof window !== "undefined";

export function getStoredTheme(): ThemePreference {
  if (!isBrowser()) return "system";
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    // Private mode / storage disabled — fall through to default.
  }
  return "system";
}

export function setStoredTheme(pref: ThemePreference): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Best-effort; nothing else to do if storage is unavailable.
  }
}

export function getSystemTheme(): ResolvedTheme {
  if (!isBrowser()) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(pref: ThemePreference): ResolvedTheme {
  return pref === "system" ? getSystemTheme() : pref;
}

/**
 * Apply a resolved theme to <html>. Briefly disables transitions so the
 * cross-tree color flip doesn't trigger a synchronized animation pulse.
 */
export function applyTheme(theme: ResolvedTheme): void {
  if (!isBrowser()) return;
  const root = document.documentElement;
  root.classList.add("disable-transitions");
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  // Force a reflow then drop the lock on the next frame.
  // Reading offsetHeight is enough to flush style recalc.
  void root.offsetHeight;
  window.requestAnimationFrame(() => {
    root.classList.remove("disable-transitions");
  });
}

/**
 * Subscribe to OS-level color-scheme changes. Returns an unsubscribe fn.
 * Old Safari versions only expose addListener/removeListener — handled here.
 */
export function subscribeSystemTheme(
  cb: (theme: ResolvedTheme) => void,
): () => void {
  if (!isBrowser()) return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e: MediaQueryListEvent) => cb(e.matches ? "dark" : "light");
  if (mq.addEventListener) {
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }
  // Legacy Safari (< 14) only exposes addListener/removeListener.
  mq.addListener(handler);
  return () => mq.removeListener(handler);
}

export function nextPreference(current: ThemePreference): ThemePreference {
  const idx = THEME_PREFERENCES.indexOf(current);
  return THEME_PREFERENCES[(idx + 1) % THEME_PREFERENCES.length];
}
