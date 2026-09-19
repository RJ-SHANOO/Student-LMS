"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import jsQR from "jsqr";
import { markAttendanceAction } from "./actions";

type Step = "scan" | "locating" | "selfie" | "submitting" | "success" | "error";

const SELFIE_DELAY_MS = 1500;
const SELFIE_MAX_DIMENSION = 480;

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export default function AttendanceCheckInPage() {
  const [step, setStep] = useState<Step>("scan");
  const [error, setError] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState<"present" | "late" | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const qrTokenRef = useRef<string | null>(null);
  const coordsRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const fail = useCallback((message: string) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    stopStream(streamRef.current);
    streamRef.current = null;
    setError(message);
    setStep("error");
  }, []);

  // Step 1: scan the QR code shown at reception, using the back camera.
  useEffect(() => {
    if (step !== "scan") return;
    let cancelled = false;

    async function startScan() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) {
          stopStream(stream);
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

        const tick = () => {
          if (cancelled) return;
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const decoded = jsQR(imageData.data, imageData.width, imageData.height);
            if (decoded?.data) {
              qrTokenRef.current = decoded.data;
              stopStream(streamRef.current);
              streamRef.current = null;
              setStep("locating");
              return;
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) fail("Camera access is required to scan the check-in QR code.");
      }
    }

    startScan();
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, [step, fail]);

  // Step 2: confirm the device's GPS position (the server checks the radius).
  useEffect(() => {
    if (step !== "locating") return;
    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        coordsRef.current = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setStep("selfie");
      },
      () => {
        if (!cancelled) fail("Location access is required to check in. Please allow location and try again.");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );

    return () => {
      cancelled = true;
    };
  }, [step, fail]);

  // Step 3: auto-capture a live front-camera selfie — never a manual upload.
  useEffect(() => {
    if (step !== "selfie") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function startSelfie() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (cancelled) {
          stopStream(stream);
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current!;
        video.srcObject = stream;
        await video.play();

        timer = setTimeout(() => {
          if (cancelled) return;
          const canvas = canvasRef.current!;
          const scale = Math.min(1, SELFIE_MAX_DIMENSION / Math.max(video.videoWidth, video.videoHeight));
          canvas.width = Math.round(video.videoWidth * scale);
          canvas.height = Math.round(video.videoHeight * scale);
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const photo = canvas.toDataURL("image/jpeg", 0.7);

          stopStream(streamRef.current);
          streamRef.current = null;

          if (!qrTokenRef.current || !coordsRef.current) {
            fail("Something went wrong. Please try again.");
            return;
          }

          setStep("submitting");
          markAttendanceAction({
            qrToken: qrTokenRef.current,
            latitude: coordsRef.current.latitude,
            longitude: coordsRef.current.longitude,
            photo,
          }).then((result) => {
            if (cancelled) return;
            if (result.ok) {
              setResultStatus(result.status ?? "present");
              setStep("success");
            } else {
              fail(result.error ?? "Something went wrong. Please try again.");
            }
          });
        }, SELFIE_DELAY_MS);
      } catch {
        if (!cancelled) fail("Camera access is required to take your check-in photo.");
      }
    }

    startSelfie();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      stopStream(streamRef.current);
      streamRef.current = null;
    };
  }, [step, fail]);

  function retry() {
    setError(null);
    setStep("scan");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-foreground">Check In</h1>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
        {(step === "scan" || step === "selfie") && (
          <div className="relative aspect-square bg-black">
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
            {step === "selfie" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <p className="rounded-full bg-black/60 px-3 py-1 text-sm text-white">Capturing selfie...</p>
              </div>
            )}
          </div>
        )}

        {step !== "scan" && step !== "selfie" && (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            {step === "locating" && (
              <>
                <Spinner />
                <p className="text-sm text-muted-foreground">Getting your location...</p>
              </>
            )}
            {step === "submitting" && (
              <>
                <Spinner />
                <p className="text-sm text-muted-foreground">Marking attendance...</p>
              </>
            )}
            {step === "success" && (
              <>
                <p
                  className="rounded-full px-3 py-1 text-sm font-medium capitalize"
                  style={{
                    backgroundColor:
                      resultStatus === "late" ? "var(--color-mod-fees-soft)" : "var(--color-mod-attendance-soft)",
                    color: resultStatus === "late" ? "var(--color-mod-fees)" : "var(--color-mod-attendance)",
                  }}
                >
                  Checked in — {resultStatus}
                </p>
                <Link href="/portal" className="text-sm font-medium text-primary underline">
                  Back to home
                </Link>
              </>
            )}
            {step === "error" && (
              <>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={retry}
                  className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {step === "scan" && (
        <p className="text-center text-sm text-muted-foreground">Point your camera at the check-in QR code</p>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function Spinner() {
  return (
    <div
      className="h-8 w-8 animate-spin rounded-full border-2 border-border"
      style={{ borderTopColor: "var(--color-primary)" }}
    />
  );
}
