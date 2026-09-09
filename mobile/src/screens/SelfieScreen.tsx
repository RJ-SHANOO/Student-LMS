import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { brand } from "../theme/colors";
import { markAttendance } from "../lib/api";
import { useSession } from "../lib/session-context";

type Props = NativeStackScreenProps<RootStackParamList, "Selfie">;

type Stage = "capturing" | "submitting" | "success" | "error";

// Gives the front camera a moment to focus/expose before the automatic
// capture — CLAUDE.md requires a live auto-selfie, never a manual shutter.
const CAPTURE_DELAY_MS = 1200;

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
        <Text style={[styles.message, { color: theme.text }]}>
          Camera access is needed to capture your check-in selfie.
        </Text>
        <Text style={[styles.link, { color: theme.primary }]} onPress={requestPermission}>
          Grant Camera Permission
        </Text>
      </View>
    );
  }

  if (stage === "success") {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Text style={[styles.successTitle, { color: brand.primaryBlue }]}>
          {result?.status === "late" ? "Checked in (Late)" : "Checked in!"}
        </Text>
        <Text style={[styles.message, { color: theme.textMuted }]}>
          {result?.checkInTime ? new Date(result.checkInTime).toLocaleTimeString() : ""}
        </Text>
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: brand.primaryBlue }]}
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
        <Text style={[styles.message, { color: "#DC2626" }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.doneButton, { backgroundColor: brand.primaryBlue }]}
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
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
  },
  link: {
    fontSize: 15,
    fontWeight: "600",
  },
  overlay: {
    position: "absolute",
    bottom: 48,
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
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  doneButton: {
    marginTop: 24,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
