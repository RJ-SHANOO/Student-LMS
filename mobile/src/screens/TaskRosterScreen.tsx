import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { cardShadow, type Theme } from "../theme/colors";
import { IconChevronLeft } from "../theme/icons";
import { getTaskDetail, type TaskDetail, type TaskStatus } from "../lib/api";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "TaskRoster">;

function statusStyle(theme: Theme, status: TaskStatus) {
  if (status === "completed") return { bg: theme.successSoft, fg: theme.success };
  if (status === "in-progress") return { bg: theme.accentSoft, fg: theme.primary };
  return { bg: theme.surfaceAlt, fg: theme.textMuted };
}

export function TaskRosterScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { session } = useSession();
  const { taskId } = route.params;
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const result = await getTaskDetail(session.token, taskId);
      setTask(result);
    } catch {
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [session, taskId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {task?.title ?? "Task"}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={theme.primary} />
      ) : !task ? (
        <Text style={{ color: theme.textMuted, textAlign: "center", marginTop: 32 }}>
          Couldn&apos;t load this task.
        </Text>
      ) : (
        <>
          <View style={[styles.summary, cardShadow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.course, { color: theme.textMuted }]}>Course: {task.audienceValue}</Text>
            {task.description && <Text style={[styles.description, { color: theme.text }]}>{task.description}</Text>}
            <Text style={[styles.progress, { color: theme.primary }]}>
              {task.completedCount}/{task.audienceCount} completed
            </Text>
          </View>

          <FlatList
            data={task.roster}
            keyExtractor={(item) => item.userId}
            refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.primary} />}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListEmptyComponent={
              <Text style={{ color: theme.textMuted, textAlign: "center", marginTop: 24 }}>
                No students in this course yet.
              </Text>
            }
            renderItem={({ item }) => {
              const status = statusStyle(theme, item.status);
              return (
                <View style={[styles.row, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowName, { color: theme.text }]}>{item.name}</Text>
                    {item.uniqueId && (
                      <Text style={[styles.rowId, { color: theme.textMuted }]}>{item.uniqueId}</Text>
                    )}
                    {item.note && <Text style={[styles.rowNote, { color: theme.textMuted }]}>{item.note}</Text>}
                  </View>
                  <View style={[styles.badge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.badgeText, { color: status.fg }]}>{item.status}</Text>
                  </View>
                </View>
              );
            }}
          />
        </>
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
    flex: 1,
  },
  summary: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  course: {
    fontSize: 13,
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
  },
  progress: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowName: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowId: {
    marginTop: 2,
    fontSize: 11,
    fontFamily: "monospace",
  },
  rowNote: {
    marginTop: 4,
    fontSize: 12,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
