import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { useThemeContext } from "../theme/ThemeContext";
import { brand } from "../theme/colors";
import { getThemePreference } from "../lib/api";
import { loadSession } from "../lib/auth-storage";
import { useSession } from "../lib/session-context";

const SPLASH_DURATION_MS = 2000;
const ANIMATE_DURATION_MS = 600;

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  const theme = useTheme();
  const { setPreference } = useThemeContext();
  const { setSession } = useSession();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATE_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: ANIMATE_DURATION_MS,
        useNativeDriver: true,
      }),
    ]);
    animation.start();

    const start = Date.now();
    loadSession().then((session) => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(SPLASH_DURATION_MS - elapsed, 0);
      setTimeout(() => {
        if (session) {
          setSession(session);
          navigation.replace("Attendance");
          // Refreshes the cached preference (applied ahead of this by
          // ThemeProvider's own AsyncStorage read) in case it changed
          // since the last login. Best-effort — don't block navigation.
          getThemePreference(session.token)
            .then(({ themePreference }) => setPreference(themePreference))
            .catch(() => {});
        } else {
          navigation.replace("Login");
        }
      }, remaining);
    });
  }, [navigation, opacity, scale, setSession, setPreference]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Text style={[styles.wordmark, { color: brand.primaryBlue }]}>SOIL</Text>
        <Text style={[styles.tagline, { color: theme.textMuted }]}>THE INNOVATORS</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    fontSize: 48,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 2,
  },
  tagline: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 4,
  },
});
