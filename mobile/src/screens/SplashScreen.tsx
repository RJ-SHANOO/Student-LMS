import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { useThemeContext } from "../theme/ThemeContext";
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
      <Animated.View style={[styles.logoCard, { opacity, transform: [{ scale }] }]}>
        <Image source={require("../../assets/branding/logo.png")} style={styles.logo} resizeMode="contain" />
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
  // The logo is designed for light backgrounds, so it always sits on a
  // white card — this keeps it legible even when the screen behind it is
  // dark-themed, per the branding spec.
  logoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
  },
  logo: {
    width: 160,
    height: 160,
  },
});
