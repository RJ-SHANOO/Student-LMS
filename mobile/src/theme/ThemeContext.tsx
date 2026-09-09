import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { darkTheme, lightTheme, type Theme } from "./colors";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "soil_theme_preference";

interface ThemeContextValue {
  preference: ThemePreference;
  theme: Theme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  // Applies the last-known tenant preference (cached at login/splash) before
  // any network round trip completes, so returning users don't see a flash
  // of the wrong theme while Splash's session check is in flight.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === "light" || stored === "dark" || stored === "system") {
          setPreferenceState(stored);
        }
      })
      .catch(() => {});
  }, []);

  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }

  const resolved = preference === "system" ? scheme : preference;
  const theme = resolved === "dark" ? darkTheme : lightTheme;

  return <ThemeContext.Provider value={{ preference, theme, setPreference }}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used within a ThemeProvider");
  return ctx;
}
