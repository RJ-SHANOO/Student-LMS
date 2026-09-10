import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { useThemeContext } from "../theme/ThemeContext";
import { cardShadow } from "../theme/colors";
import { IconLogOut, IconQrScan, IconTasks, IconUser } from "../theme/icons";
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
      <View style={styles.header}>
        <View style={styles.identity}>
          <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
            <IconUser size={22} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>Hi, {session?.name}</Text>
            {session?.uniqueId && (
              <Text style={[styles.uniqueId, { color: theme.textMuted }]}>{session.uniqueId}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.logoutButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <IconLogOut size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryCard,
            cardShadow,
            { backgroundColor: theme.primary, transform: [{ scale: pressed ? 0.97 : 1 }] },
          ]}
          onPress={() => navigation.navigate("Scan")}
        >
          <View style={styles.primaryCardIcon}>
            <IconQrScan size={28} color="#fff" />
          </View>
          <View style={styles.primaryCardText}>
            <Text style={styles.primaryCardTitle}>Mark Attendance</Text>
            <Text style={styles.primaryCardSubtitle}>Scan the QR code at reception</Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.secondaryCard,
            cardShadow,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
          onPress={() => navigation.navigate("Tasks")}
        >
          <View style={[styles.secondaryCardIcon, { backgroundColor: theme.violetSoft }]}>
            <IconTasks size={22} color={theme.violet} />
          </View>
          <View style={styles.primaryCardText}>
            <Text style={[styles.secondaryCardTitle, { color: theme.text }]}>My Tasks</Text>
            <Text style={[styles.secondaryCardSubtitle, { color: theme.textMuted }]}>
              View and complete what's assigned to you
            </Text>
          </View>
        </Pressable>
      </View>

      <Text style={[styles.footer, { color: theme.textMuted }]}>SOIL — The Innovators</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
  },
  uniqueId: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: "monospace",
  },
  logoutButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flex: 1,
    justifyContent: "center",
    gap: 14,
  },
  primaryCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  primaryCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCardText: {
    flex: 1,
  },
  primaryCardTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  primaryCardSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 2,
  },
  secondaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  secondaryCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryCardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryCardSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
