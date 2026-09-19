"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/logo";

const SESSION_KEY = "soil_splash_shown";
const VISIBLE_MS = 2000;
const FADE_MS = 400;

// Shown once per browser tab session (not on every client-side navigation —
// the root layout only remounts on a fresh full load, e.g. a PWA launch from
// the home screen) per CLAUDE.md's ~2s fade-in + scale-up splash spec.
export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // One-time client-only reveal gated by sessionStorage, not state derived
    // from props/other state — the synchronous setState here is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
    const fadeTimer = setTimeout(() => setFadingOut(true), VISIBLE_MS - FADE_MS);
    // Mark as shown only once the animation actually completes, not up front —
    // in dev, StrictMode runs this effect (and its cleanup) twice, and marking
    // the session up front would make the second run skip re-scheduling these
    // timers, leaving the splash stuck visible forever with nothing left to
    // dismiss it.
    const hideTimer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, VISIBLE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-[400ms] ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <Logo size={120} className="animate-splash-logo" />
    </div>
  );
}
