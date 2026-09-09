import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import * as Location from "expo-location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/useTheme";

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
        <Text style={[styles.message, { color: theme.text }]}>
          Camera access is needed to scan the attendance QR code.
        </Text>
        <Text style={[styles.link, { color: theme.primary }]} onPress={requestPermission}>
          Grant Camera Permission
        </Text>
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
      <View style={styles.overlay}>
        {stage === "locating" && (
          <>
            <ActivityIndicator color="#fff" />
            <Text style={styles.overlayText}>Getting your location...</Text>
          </>
        )}
        {stage === "scanning" && <Text style={styles.overlayText}>Point your camera at the QR code</Text>}
        {stage === "error" && <Text style={styles.overlayText}>{error}</Text>}
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
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
