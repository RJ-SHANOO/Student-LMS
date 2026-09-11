import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { useThemeContext } from "../theme/ThemeContext";
import { cardShadow } from "../theme/colors";
import {
  IconCalendar,
  IconCheckCircle,
  IconClipboardList,
  IconLogOut,
  IconQrScan,
  IconSettings,
  IconTasks,
  IconUser,
} from "../theme/icons";
import { clearSession } from "../lib/auth-storage";
import { useSession } from "../lib/session-context";
import { getMyAttendance, type MyAttendanceRecord } from "../lib/api";

type Props = NativeStackScreenProps<RootStackParamList, "Attendance">;

// Matches the server's `todayDateString` format (YYYY-MM-DD) so a fresh
// check-in's date lines up with what the device considers "today". Both
// sides use their own local wall clock — see the same caveat in
// web/src/lib/services/attendance.ts if the institute and server end up in
// different timezones.
function todayDateString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AttendanceHomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { clearOverrideOnLogout } = useThemeContext();
  const { session, setSession } = useSession();
  const canAssignTasks = session?.role === "employee" && (session.coursesTaught?.length ?? 0) > 0;
  const [todayRecord, setTodayRecord] = useState<MyAttendanceRecord | null | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      getMyAttendance(session.token)
        .then((records) => {
          const today = todayDateString();
          setTodayRecord(records.find((r) => r.date === today) ?? null);
        })
        .catch(() => setTodayRecord(null));
    }, [session])
  );

  async function handleLogout() {
    await clearSession();
    setSession(null);
    // Devices can be shared across tenants (e.g. a reception tablet) —
    // don't carry this account's theme choice (personal or tenant-synced)
    // into the next login.
    clearOverrideOnLogout();
    navigation.replace("Login");
  }

  const isLate = todayRecord?.status === "late";

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
        <View style={styles.headerActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Settings")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <IconSettings size={18} color={theme.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <IconLogOut size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actions}>
        {todayRecord ? (
          <View
            style={[
              styles.statusCard,
              cardShadow,
              { backgroundColor: isLate ? theme.dangerSoft : theme.successSoft },
            ]}
          >
            <View
              style={[
                styles.primaryCardIcon,
                { backgroundColor: isLate ? "rgba(220,38,38,0.15)" : "rgba(22,163,74,0.15)" },
              ]}
            >
              <IconCheckCircle size={28} color={isLate ? theme.danger : theme.success} />
            </View>
            <View style={styles.primaryCardText}>
              <Text style={[styles.statusTitle, { color: isLate ? theme.danger : theme.success }]}>
                {isLate ? "Checked in (Late)" : "Checked in for today"}
              </Text>
              <Text style={[styles.statusSubtitle, { color: theme.textMuted }]}>
                {todayRecord.checkInTime
                  ? `At ${new Date(todayRecord.checkInTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "See you tomorrow"}
              </Text>
            </View>
          </View>
        ) : (
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
        )}

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
          onPress={() => navigation.navigate("AttendanceHistory")}
        >
          <View style={[styles.secondaryCardIcon, { backgroundColor: theme.surfaceAlt }]}>
            <IconCalendar size={22} color={theme.textMuted} />
          </View>
          <View style={styles.primaryCardText}>
            <Text style={[styles.secondaryCardTitle, { color: theme.text }]}>Attendance History</Text>
            <Text style={[styles.secondaryCardSubtitle, { color: theme.textMuted }]}>
              See your past check-ins
            </Text>
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

        {canAssignTasks && (
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
            onPress={() => navigation.navigate("InstructorTasks")}
          >
            <View style={[styles.secondaryCardIcon, { backgroundColor: theme.accentSoft }]}>
              <IconClipboardList size={22} color={theme.primary} />
            </View>
            <View style={styles.primaryCardText}>
              <Text style={[styles.secondaryCardTitle, { color: theme.text }]}>Assigned Tasks</Text>
              <Text style={[styles.secondaryCardSubtitle, { color: theme.textMuted }]}>
                Assign work to your courses and track completion
              </Text>
            </View>
          </Pressable>
        )}
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
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  iconButton: {
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
  statusCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  statusSubtitle: {
    fontSize: 13,
    marginTop: 2,
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
