import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { useThemeContext, type ThemePreference } from "../theme/ThemeContext";
import { cardShadow } from "../theme/colors";
import { IconCheckCircle, IconChevronLeft, IconDevice, IconMoon, IconSun, IconUser } from "../theme/icons";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

const THEME_OPTIONS: { value: ThemePreference; label: string; description: string; Icon: typeof IconSun }[] = [
  { value: "system", label: "Match System", description: "Follows your device's setting", Icon: IconDevice },
  { value: "light", label: "Light", description: "Bright background, dark text", Icon: IconSun },
  { value: "dark", label: "Dark", description: "Dark background, easy on the eyes", Icon: IconMoon },
];

export function SettingsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { session } = useSession();
  const { preference, setPreference } = useThemeContext();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <IconChevronLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
      </View>

      <View style={[styles.profileCard, cardShadow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.accentSoft }]}>
          <IconUser size={26} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.profileName, { color: theme.text }]}>{session?.name}</Text>
          <Text style={[styles.profileMeta, { color: theme.textMuted }]}>
            {session?.role === "employee" ? "Employee" : "Student"}
            {session?.uniqueId ? ` · ${session.uniqueId}` : ""}
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Appearance</Text>
      <View style={[styles.card, cardShadow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {THEME_OPTIONS.map((option, index) => {
          const selected = preference === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.8}
              onPress={() => setPreference(option.value)}
              style={[
                styles.optionRow,
                index < THEME_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.surfaceAlt }]}>
                <option.Icon size={20} color={selected ? theme.primary : theme.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionLabel, { color: theme.text }]}>{option.label}</Text>
                <Text style={[styles.optionDescription, { color: theme.textMuted }]}>{option.description}</Text>
              </View>
              {selected && <IconCheckCircle size={20} color={theme.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.footer, { color: theme.textMuted }]}>SOIL — The Innovators</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
  },
  profileMeta: {
    marginTop: 2,
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  optionDescription: {
    marginTop: 2,
    fontSize: 12.5,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 32,
  },
});
