import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import * as Location from "expo-location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";
import { IconAlertCircle, IconCamera, IconChevronLeft } from "../theme/icons";

type Props = NativeStackScreenProps<RootStackParamList, "Scan">;

type Stage = "scanning" | "locating" | "error";

export function ScanScreen({ navigation }: Props) {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>("scanning");
  const [error, setError] = useState<string | null>(null);
  const [scannedOnce, setScannedOnce] = useState(false);

  async function handleBarcodeScanned({ data }: BarcodeScanningResult) {
    if (scannedOnce) return;
    setScannedOnce(true);
    setStage("locating");

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission is required to mark attendance");
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      navigation.replace("Selfie", {
        qrToken: data,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not get your location");
      setStage("error");
      setScannedOnce(false);
    }
  }

  if (!permission) {
    return <View style={[styles.center, { backgroundColor: theme.background }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <View style={[styles.permissionIcon, { backgroundColor: theme.accentSoft }]}>
          <IconCamera size={30} color={theme.primary} />
        </View>
        <Text style={[styles.message, { color: theme.text }]}>
          Camera access is needed to scan the attendance QR code.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.primaryButtonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={stage === "scanning" ? handleBarcodeScanned : undefined}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <IconChevronLeft size={22} color="#fff" />
      </TouchableOpacity>

      {stage === "scanning" && (
        <View pointerEvents="none" style={styles.frameWrap}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>
      )}

      <View style={styles.overlay}>
        {stage === "locating" && (
          <>
            <ActivityIndicator color="#fff" />
            <Text style={styles.overlayText}>Getting your location...</Text>
          </>
        )}
        {stage === "scanning" && (
          <Text style={styles.overlayText}>Point your camera at the QR code</Text>
        )}
        {stage === "error" && (
          <View style={styles.errorRow}>
            <IconAlertCircle size={18} color="#fff" />
            <Text style={styles.overlayText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const FRAME_SIZE = 240;

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
  permissionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 21,
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    top: 56,
    left: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  frameWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#5AB3E0",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderRightWidth: 3,
    borderTopWidth: 3,
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderLeftWidth: 3,
    borderBottomWidth: 3,
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderBottomRightRadius: 12,
  },
  overlay: {
    position: "absolute",
    bottom: 56,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
  },
  overlayText: {
    color: "#fff",
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
