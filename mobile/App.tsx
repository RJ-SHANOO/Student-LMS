import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { SessionProvider } from "./src/lib/session-context";
import { ThemeProvider } from "./src/theme/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <SessionProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </SessionProvider>
    </ThemeProvider>
  );
}
