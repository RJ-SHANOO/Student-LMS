import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { cardShadow } from "../theme/colors";
import { IconChevronLeft, IconClipboardList } from "../theme/icons";
import { getMyAssignedTasks, type AssignedTask } from "../lib/api";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "InstructorTasks">;

export function InstructorTasksScreen({ navigation }: Props) {
  const theme = useTheme();
  const { session } = useSession();
  const [tasks, setTasks] = useState<AssignedTask[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const result = await getMyAssignedTasks(session.token);
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
        <Text style={[styles.title, { color: theme.text }]}>Tasks I Assigned</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.newButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("AssignTask")}
      >
        <Text style={styles.newButtonText}>+ New Task</Text>
      </TouchableOpacity>

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
                <IconClipboardList size={26} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                You haven&apos;t assigned any tasks yet.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                cardShadow,
                { borderColor: theme.border, backgroundColor: theme.surface, opacity: pressed ? 0.9 : 1 },
              ]}
              onPress={() => navigation.navigate("TaskRoster", { taskId: item._id })}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
                  <Text style={[styles.badgeText, { color: theme.primary }]}>
                    {item.completedCount}/{item.audienceCount}
                  </Text>
                </View>
              </View>
              <Text style={[styles.course, { color: theme.textMuted }]}>Course: {item.audienceValue}</Text>
              {item.dueDate && (
                <Text style={[styles.due, { color: theme.textMuted }]}>
                  Due {new Date(item.dueDate).toLocaleDateString()}
                </Text>
              )}
            </Pressable>
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
  newButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  newButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
  },
  course: {
    marginTop: 6,
    fontSize: 13,
  },
  due: {
    marginTop: 4,
    fontSize: 12,
  },
});
