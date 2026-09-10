import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { cardShadow, type Theme } from "../theme/colors";
import { IconChevronLeft, IconTasks } from "../theme/icons";
import { getMyTasks, updateTaskStatus, type Task } from "../lib/api";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "Tasks">;

function statusStyle(theme: Theme, status: Task["status"]) {
  if (status === "completed") return { bg: theme.successSoft, fg: theme.success };
  if (status === "in-progress") return { bg: theme.accentSoft, fg: theme.primary };
  return { bg: theme.surfaceAlt, fg: theme.textMuted };
}

export function TasksScreen({ navigation }: Props) {
  const theme = useTheme();
  const { session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const result = await getMyTasks(session.token);
      setTasks(result);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleComplete(task: Task) {
    if (!session) return;
    setUpdatingId(task._id);
    try {
      await updateTaskStatus(session.token, task._id, "completed");
      setTasks((prev) => prev.map((t) => (t._id === task._id ? { ...t, status: "completed" } : t)));
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <IconChevronLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>My Tasks</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={theme.primary} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.primary} />}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceAlt }]}>
                <IconTasks size={26} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No tasks assigned yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const status = statusStyle(theme, item.status);
            return (
              <View style={[styles.card, cardShadow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                  <View style={[styles.badge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.badgeText, { color: status.fg }]}>{item.status}</Text>
                  </View>
                </View>
                {item.description && (
                  <Text style={[styles.description, { color: theme.textMuted }]}>{item.description}</Text>
                )}
                {item.dueDate && (
                  <Text style={[styles.due, { color: theme.textMuted }]}>
                    Due {new Date(item.dueDate).toLocaleDateString()}
                  </Text>
                )}
                {item.status !== "completed" && (
                  <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: theme.primary }]}
                    onPress={() => handleComplete(item)}
                    disabled={updatingId === item._id}
                  >
                    <Text style={styles.completeButtonText}>
                      {updatingId === item._id ? "Saving..." : "Mark Complete"}
                    </Text>
                  </TouchableOpacity>
                )}
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
    marginBottom: 20,
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
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  due: {
    marginTop: 8,
    fontSize: 12,
  },
  completeButton: {
    marginTop: 14,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
