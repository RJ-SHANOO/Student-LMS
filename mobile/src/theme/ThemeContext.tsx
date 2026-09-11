import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkTheme, lightTheme, type Theme } from "./colors";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "soil_theme_preference";
// Set the moment a user picks a theme themselves in Settings. Once set, the
// tenant-wide default fetched at login/splash must never silently overwrite
// their personal choice again.
const OVERRIDE_KEY = "soil_theme_user_override";

interface ThemeContextValue {
  preference: ThemePreference;
  theme: Theme;
  hasUserOverride: boolean;
  // User-initiated: from the Settings screen. Persists and locks out the
  // tenant default from here on.
  setPreference: (preference: ThemePreference) => void;
  // System-initiated: from Splash/Login syncing the tenant's configured
  // default. No-ops once the user has set their own preference, and clears
  // on logout so the next tenant/account starts fresh.
  applyTenantDefault: (preference: ThemePreference) => void;
  clearOverrideOnLogout: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [hasUserOverride, setHasUserOverride] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(OVERRIDE_KEY)])
      .then(([storedPref, storedOverride]) => {
        if (storedPref === "light" || storedPref === "dark" || storedPref === "system") {
          setPreferenceState(storedPref);
        }
        setHasUserOverride(storedOverride === "true");
      })
      .catch(() => {});
  }, []);

  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
    setHasUserOverride(true);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
    AsyncStorage.setItem(OVERRIDE_KEY, "true").catch(() => {});
  }

  function applyTenantDefault(next: ThemePreference) {
    setHasUserOverride((current) => {
      if (current) return current;
      setPreferenceState(next);
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return current;
    });
  }

  function clearOverrideOnLogout() {
    setHasUserOverride(false);
    setPreferenceState("system");
    AsyncStorage.removeItem(OVERRIDE_KEY).catch(() => {});
    AsyncStorage.setItem(STORAGE_KEY, "system").catch(() => {});
  }

  const resolved = preference === "system" ? scheme : preference;
  const theme = resolved === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{ preference, theme, hasUserOverride, setPreference, applyTenantDefault, clearOverrideOnLogout }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within a ThemeProvider");
  return ctx;
}
