import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { useThemeContext } from "../theme/ThemeContext";
import { brand } from "../theme/colors";
import { clearSession } from "../lib/auth-storage";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "Attendance">;

export function AttendanceHomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { setPreference } = useThemeContext();
  const { session, setSession } = useSession();

  async function handleLogout() {
    await clearSession();
    setSession(null);
    // Devices can be shared across tenants (e.g. a reception tablet) —
    // don't carry this tenant's theme choice into the next login.
    setPreference("system");
    navigation.replace("Login");
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View>
        <Text style={[styles.greeting, { color: theme.text }]}>Hi, {session?.name}</Text>
        {session?.uniqueId && (
          <Text style={[styles.uniqueId, { color: theme.textMuted }]}>{session.uniqueId}</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.scanButton, { backgroundColor: brand.primaryBlue }]}
          onPress={() => navigation.navigate("Scan")}
        >
          <Text style={styles.scanButtonText}>Mark Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tasksButton, { borderColor: brand.primaryBlue }]}
          onPress={() => navigation.navigate("Tasks")}
        >
          <Text style={[styles.tasksButtonText, { color: brand.primaryBlue }]}>My Tasks</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogout}>
        <Text style={[styles.logout, { color: theme.textMuted }]}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "600",
  },
  uniqueId: {
    marginTop: 4,
    fontSize: 13,
  },
  actions: {
    gap: 12,
  },
  scanButton: {
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  tasksButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  tasksButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  logout: {
    textAlign: "center",
    fontSize: 14,
  },
});
