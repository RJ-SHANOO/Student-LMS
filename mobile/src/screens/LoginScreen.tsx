import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { useThemeContext } from "../theme/ThemeContext";
import { brand } from "../theme/colors";
import { getThemePreference, loginMember } from "../lib/api";
import { saveSession } from "../lib/auth-storage";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const theme = useTheme();
  const { setPreference } = useThemeContext();
  const { setSession } = useSession();
  const [cnic, setCnic] = useState("");
  const [dob, setDob] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);
    try {
      const result = await loginMember(cnic.trim(), dob.trim());
      const session = {
        token: result.token,
        userId: result.user.id,
        name: result.user.name,
        role: result.user.role,
        uniqueId: result.user.uniqueId,
      };
      await saveSession(session);
      setSession(session);
      // Best-effort: don't block the login transition on this round trip.
      getThemePreference(session.token)
        .then(({ themePreference }) => setPreference(themePreference))
        .catch(() => {});
      navigation.replace("Attendance");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Image
        source={require("../../assets/branding/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>Employee / Student Login</Text>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.text }]}>CNIC (13 digits)</Text>
        <TextInput
          value={cnic}
          onChangeText={setCnic}
          keyboardType="number-pad"
          placeholder="3520212345671"
          placeholderTextColor={theme.textMuted}
          maxLength={15}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        />
      </View>

      <View style={styles.field}>
        <Text style={[styles.label, { color: theme.text }]}>Date of Birth (YYYY-MM-DD)</Text>
        <TextInput
          value={dob}
          onChangeText={setDob}
          placeholder="2000-01-01"
          placeholderTextColor={theme.textMuted}
          maxLength={10}
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: brand.primaryBlue, opacity: loading ? 0.6 : 1 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 96,
    height: 96,
    alignSelf: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 32,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
