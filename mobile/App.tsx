import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { SessionProvider } from "./src/lib/session-context";
import { ThemeProvider } from "./src/theme/ThemeContext";

// Keeps the native splash up until our own animated Splash screen (which
// shows the same logo) has mounted, so there's no flash of blank screen
// between the native splash hiding and the JS splash appearing.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider>
      <SessionProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </SessionProvider>
    </ThemeProvider>
  );
}
