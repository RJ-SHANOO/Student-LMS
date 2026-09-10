import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { cardShadow } from "../theme/colors";
import { IconAlertCircle, IconChevronLeft, IconCheckCircle } from "../theme/icons";
import { createTask } from "../lib/api";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "AssignTask">;

export function AssignTaskScreen({ navigation }: Props) {
  const theme = useTheme();
  const { session } = useSession();
  const courses = session?.coursesTaught ?? [];

  const [course, setCourse] = useState(courses[0] ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!session || !course) return;
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      setError("Due date must be in YYYY-MM-DD format");
      return;
    }
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      await createTask(session.token, {
        audienceType: "course",
        audienceValue: course,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <IconChevronLeft size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Assign Task</Text>
        </View>

        <View style={[styles.card, cardShadow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Course</Text>
            <View style={styles.courseRow}>
              {courses.map((c) => {
                const selected = c === course;
                return (
                  <TouchableOpacity
                    key={c}
                    activeOpacity={0.8}
                    onPress={() => setCourse(c)}
                    style={[
                      styles.courseChip,
                      {
                        backgroundColor: selected ? theme.primary : theme.surfaceAlt,
                        borderColor: selected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={{ color: selected ? "#fff" : theme.text, fontWeight: "600", fontSize: 13 }}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.hint, { color: theme.textMuted }]}>
              Every active student in this course will see this task.
            </Text>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Assignment 1"
              placeholderTextColor={theme.textMuted}
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surfaceAlt }]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Description (optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="What should students do?"
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
              style={[
                styles.input,
                styles.multiline,
                { borderColor: theme.border, color: theme.text, backgroundColor: theme.surfaceAlt },
              ]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: theme.text }]}>Due Date (optional, YYYY-MM-DD)</Text>
            <TextInput
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="2026-09-30"
              placeholderTextColor={theme.textMuted}
              maxLength={10}
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surfaceAlt }]}
            />
          </View>

          {error && (
            <View style={[styles.messageBox, { backgroundColor: theme.dangerSoft }]}>
              <IconAlertCircle size={16} color={theme.danger} />
              <Text style={[styles.messageText, { color: theme.danger }]}>{error}</Text>
            </View>
          )}
          {success && (
            <View style={[styles.messageBox, { backgroundColor: theme.successSoft }]}>
              <IconCheckCircle size={16} color={theme.success} />
              <Text style={[styles.messageText, { color: theme.success }]}>Task assigned to {course}.</Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.button, { backgroundColor: theme.primary, opacity: loading || !course || !title.trim() ? 0.6 : 1 }]}
            onPress={handleSubmit}
            disabled={loading || !course || !title.trim()}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Assign Task</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 32,
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
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
  },
  courseRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  courseChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  messageText: {
    fontSize: 13,
    flex: 1,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
