"use client";

import { useEffect } from "react";

type ThemePreference = "light" | "dark" | "system";

function applyTheme(forced: ThemePreference): (() => void) | void {
  if (forced === "dark") {
    document.documentElement.classList.add("dark");
    return;
  }
  if (forced === "light") {
    document.documentElement.classList.remove("dark");
    return;
  }

  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => document.documentElement.classList.toggle("dark", mql.matches);
  apply();
  mql.addEventListener("change", apply);
  return () => mql.removeEventListener("change", apply);
}

// Renders an inline (blocking) <script> so the correct class lands on <html>
// before the browser paints — avoids a flash of the wrong theme. Mount this
// ONLY in the root layout: it never remounts across navigations, so the
// script tag is only ever created by the browser's HTML parser (which runs
// it) and never by a client-side re-render (which can't — React logs
// "Encountered a script tag while rendering React component" if a script
// tag is (re)created outside the initial HTML parse, e.g. in a nested layout
// that mounts fresh after a redirect). For a preference known only deeper in
// the tree (a tenant's saved Settings, fetched by a nested layout), use
// ThemeOverride instead — same effect, no script tag, safe to remount.
export function ThemeScript({ forced = "system" }: { forced?: ThemePreference }) {
  useEffect(() => applyTheme(forced), [forced]);

  const inline =
    forced === "dark"
      ? "document.documentElement.classList.add('dark');"
      : forced === "light"
        ? "document.documentElement.classList.remove('dark');"
        : "document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);";

  return <script dangerouslySetInnerHTML={{ __html: inline }} />;
}

// Applies a preference from a layout that can mount/remount on client-side
// navigation (e.g. right after a login redirect) without ever touching the
// DOM until after React has committed — safe to use anywhere.
export function ThemeOverride({ preference }: { preference: ThemePreference }) {
  useEffect(() => applyTheme(preference), [preference]);
  return null;
}
