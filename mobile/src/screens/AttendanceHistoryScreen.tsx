import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { cardShadow, type Theme } from "../theme/colors";
import { IconCalendar, IconChevronLeft } from "../theme/icons";
import { getMyAttendance, type MyAttendanceRecord } from "../lib/api";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "AttendanceHistory">;

function statusStyle(theme: Theme, status: MyAttendanceRecord["status"]) {
  if (status === "present") return { bg: theme.successSoft, fg: theme.success };
  if (status === "late") return { bg: theme.dangerSoft, fg: theme.danger };
  return { bg: theme.surfaceAlt, fg: theme.textMuted };
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AttendanceHistoryScreen({ navigation }: Props) {
  const theme = useTheme();
  const { session } = useSession();
  const [records, setRecords] = useState<MyAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const result = await getMyAttendance(session.token);
      setRecords(result);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <IconChevronLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Attendance History</Text>
      </View>

      {!loading && records.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, cardShadow, { backgroundColor: theme.successSoft }]}>
            <Text style={[styles.summaryCount, { color: theme.success }]}>{presentCount}</Text>
            <Text style={[styles.summaryLabel, { color: theme.success }]}>Present</Text>
          </View>
          <View style={[styles.summaryCard, cardShadow, { backgroundColor: theme.dangerSoft }]}>
            <Text style={[styles.summaryCount, { color: theme.danger }]}>{lateCount}</Text>
            <Text style={[styles.summaryLabel, { color: theme.danger }]}>Late</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={theme.primary} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.primary} />}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceAlt }]}>
                <IconCalendar size={26} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No attendance marked yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const status = statusStyle(theme, item.status);
            return (
              <View style={[styles.row, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowDate, { color: theme.text }]}>{formatDate(item.date)}</Text>
                  {item.checkInTime && (
                    <Text style={[styles.rowTime, { color: theme.textMuted }]}>
                      Checked in at{" "}
                      {new Date(item.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  )}
                </View>
                <View style={[styles.badge, { backgroundColor: status.bg }]}>
                  <Text style={[styles.badgeText, { color: status.fg }]}>{item.status}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  summaryCount: {
    fontSize: 22,
    fontWeight: "800",
  },
  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 48,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowDate: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowTime: {
    marginTop: 3,
    fontSize: 12.5,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
