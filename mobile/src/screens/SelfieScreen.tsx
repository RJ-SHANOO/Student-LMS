import { useEffect, useRef, useState } from "react";
import { Animated, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { IconAlertCircle, IconCamera, IconCheckCircle } from "../theme/icons";
import { markAttendance } from "../lib/api";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "Selfie">;

type Stage = "capturing" | "submitting" | "success" | "error";

// Gives the front camera a moment to focus/expose before the automatic
// capture — CLAUDE.md requires a live auto-selfie, never a manual shutter.
const CAPTURE_DELAY_MS = 1200;

// A small pop-in for the result icon badge — the one moment this screen
// should feel alive, kept to a single spring so it doesn't overdo it.
function AnimatedIconBadge({ backgroundColor, children }: { backgroundColor: string; children: React.ReactNode }) {
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [scale]);

  return (
    <Animated.View style={[styles.iconBadge, { backgroundColor, transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}

export function SelfieScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { session } = useSession();
  const { qrToken, latitude, longitude } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>("capturing");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: string; checkInTime: string } | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const capturedOnce = useRef(false);

  async function handleCameraReady() {
    if (capturedOnce.current) return;
    capturedOnce.current = true;

    setTimeout(async () => {
      try {
        const photo = await cameraRef.current?.takePictureAsync({ base64: true, quality: 0.5 });
        if (!photo?.base64) throw new Error("Could not capture photo");

        setStage("submitting");
        const dataUri = `data:image/jpeg;base64,${photo.base64}`;
        const marked = await markAttendance(session!.token, {
          qrToken,
          latitude,
          longitude,
          photo: dataUri,
        });
        setResult(marked);
        setStage("success");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not mark attendance");
        setStage("error");
      }
    }, CAPTURE_DELAY_MS);
  }

  if (!permission) {
    return <View style={[styles.center, { backgroundColor: theme.background }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AnimatedIconBadge backgroundColor={theme.accentSoft}>
          <IconCamera size={30} color={theme.primary} />
        </AnimatedIconBadge>
        <Text style={[styles.message, { color: theme.text }]}>
          Camera access is needed to capture your check-in selfie.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.doneButton, { backgroundColor: theme.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.doneButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stage === "success") {
    const isLate = result?.status === "late";
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AnimatedIconBadge backgroundColor={isLate ? theme.dangerSoft : theme.successSoft}>
          <IconCheckCircle size={34} color={isLate ? theme.danger : theme.success} />
        </AnimatedIconBadge>
        <Text style={[styles.successTitle, { color: theme.text }]}>
          {isLate ? "Checked in (Late)" : "Checked in!"}
        </Text>
        <Text style={[styles.message, { color: theme.textMuted, marginBottom: 0 }]}>
          {result?.checkInTime ? new Date(result.checkInTime).toLocaleTimeString() : ""}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.doneButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.replace("Attendance")}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (stage === "error") {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <AnimatedIconBadge backgroundColor={theme.dangerSoft}>
          <IconAlertCircle size={30} color={theme.danger} />
        </AnimatedIconBadge>
        <Text style={[styles.message, { color: theme.text }]}>{error}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.doneButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.replace("Attendance")}
        >
          <Text style={styles.doneButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" onCameraReady={handleCameraReady} />
      <View style={styles.faceGuide} pointerEvents="none" />
      <View style={styles.overlay}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.overlayText}>
          {stage === "submitting" ? "Marking attendance..." : "Hold still..."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 21,
  },
  faceGuide: {
    position: "absolute",
    top: "28%",
    left: "22%",
    right: "22%",
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    borderStyle: "dashed",
  },
  overlay: {
    position: "absolute",
    bottom: 56,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  overlayText: {
    color: "#fff",
    fontSize: 15,
    marginTop: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  doneButton: {
    marginTop: 24,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
