import { readFileSync } from "fs";
import { join } from "path";
import { ImageResponse } from "next/og";

let cachedLogoDataUrl: string | null = null;

function logoDataUrl() {
  if (!cachedLogoDataUrl) {
    const buffer = readFileSync(join(process.cwd(), "public/branding/logo.png"));
    cachedLogoDataUrl = `data:image/png;base64,${buffer.toString("base64")}`;
  }
  return cachedLogoDataUrl;
}

// Every PWA/home-screen icon is the logo centered on a white square — the
// logo itself is light-themed (per CLAUDE.md), so a white backing keeps it
// legible regardless of the OS icon shape mask or system theme.
export function renderIcon(canvasSize: number, logoSize: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) rendering, not a Next <Image> context */}
        <img src={logoDataUrl()} width={logoSize} height={logoSize} alt="" />
      </div>
    ),
    { width: canvasSize, height: canvasSize }
  );
}
