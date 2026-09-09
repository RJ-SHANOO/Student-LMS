"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { getQrTokenAction } from "./actions";

export function QrDisplay() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const expiresInRef = useRef(45);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const { token, expiresIn } = await getQrTokenAction();
        if (cancelled) return;
        const url = await QRCode.toDataURL(token, { width: 320, margin: 1 });
        if (cancelled) return;
        setImageUrl(url);
        setError(null);
        expiresInRef.current = expiresIn;
        setSecondsLeft(expiresIn);
      } catch {
        if (!cancelled) setError("Could not refresh the QR code. Retrying...");
      }
    }

    refresh();
    const refreshId = setInterval(refresh, expiresInRef.current * 1000 - 3000);
    const countdownId = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => {
      cancelled = true;
      clearInterval(refreshId);
      clearInterval(countdownId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data: URL, not an optimizable remote image
        <img src={imageUrl} alt="Attendance check-in QR code" width={320} height={320} />
      ) : (
        <div className="flex h-80 w-80 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
          Loading...
        </div>
      )}
      <p className="text-sm text-muted-foreground">Refreshes in {secondsLeft}s</p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
