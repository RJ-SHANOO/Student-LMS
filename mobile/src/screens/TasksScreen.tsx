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
import { brand } from "../theme/colors";
import { getMyTasks, updateTaskStatus, type Task } from "../lib/api";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "Tasks">;

const statusColor: Record<Task["status"], string> = {
  pending: "#8A8A8A",
  "in-progress": brand.accentSkyBlue,
  completed: "#22C55E",
};

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
        <Text style={[styles.backLink, { color: theme.textMuted }]} onPress={() => navigation.goBack()}>
          ← Back
        </Text>
        <Text style={[styles.title, { color: theme.text }]}>My Tasks</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 32 }} color={brand.primaryBlue} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.textMuted }]}>No tasks assigned yet.</Text>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: statusColor[item.status] }]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
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
                  style={[styles.completeButton, { borderColor: brand.primaryBlue }]}
                  onPress={() => handleComplete(item)}
                  disabled={updatingId === item._id}
                >
                  <Text style={[styles.completeButtonText, { color: brand.primaryBlue }]}>
                    {updatingId === item._id ? "Saving..." : "Mark Complete"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
    marginBottom: 16,
  },
  backLink: {
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  empty: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 14,
  },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
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
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  description: {
    marginTop: 6,
    fontSize: 13,
  },
  due: {
    marginTop: 6,
    fontSize: 12,
  },
  completeButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
