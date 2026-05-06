"use client";

import { useCallback, useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import {
  applyTheme,
  getStoredTheme,
  nextPreference,
  resolveTheme,
  setStoredTheme,
  subscribeSystemTheme,
  type ThemePreference,
} from "@/lib/theme";

const PREF_LABEL: Record<ThemePreference, string> = {
  system: "跟随系统",
  light: "浅色",
  dark: "深色",
};

const NEXT_LABEL: Record<ThemePreference, string> = {
  system: "浅色",
  light: "深色",
  dark: "跟随系统",
};

export default function FloatingThemeToggle() {
  // SSR-safe initial: assume `system` until the client mounts and reads storage.
  // We don't render the icon until then (mounted flag) to avoid a wrong-icon flash.
  const [pref, setPref] = useState<ThemePreference>("system");
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage once on the client.
  useEffect(() => {
    setPref(getStoredTheme());
    setMounted(true);
  }, []);

  // Keep <html class="dark"> in sync when the OS theme changes
  // *and* the user is on `system`. Skipped otherwise.
  useEffect(() => {
    if (pref !== "system") return;
    const unsubscribe = subscribeSystemTheme((sys) => applyTheme(sys));
    return unsubscribe;
  }, [pref]);

  const handleClick = useCallback(() => {
    const next = nextPreference(pref);
    setPref(next);
    setStoredTheme(next);
    applyTheme(resolveTheme(next));
  }, [pref]);

  const next = nextPreference(pref);
  const ariaLabel = `主题：${PREF_LABEL[pref]}，点击切换到${NEXT_LABEL[pref]}`;

  // Pre-mount: render an empty placeholder so layout doesn't shift,
  // but no icon (the saved pref isn't known yet).
  const Icon = pref === "system" ? Monitor : pref === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      title={`主题：${PREF_LABEL[pref]} · 点击切换到${NEXT_LABEL[pref]}`}
      className="
        group fixed right-6 z-[60] flex h-12 w-12 items-center justify-center
        rounded-full border border-border/50 bg-card/80 backdrop-blur-md
        shadow-soft transition-all duration-300
        hover:scale-105 hover:-translate-y-0.5 hover:shadow-soft-lg
        active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2
        print:hidden
      "
      style={{
        bottom: "max(1.5rem, env(safe-area-inset-bottom) + 0.75rem)",
      }}
      data-pref={pref}
      data-next={next}
    >
      <span
        key={pref}
        className={`flex h-5 w-5 items-center justify-center text-foreground/80 transition-all duration-150 group-hover:text-primary ${
          mounted ? "opacity-100 rotate-0" : "opacity-0 -rotate-45"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
    </button>
  );
}
