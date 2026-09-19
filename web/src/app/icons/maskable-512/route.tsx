import { renderIcon } from "@/lib/pwa-icon";

export const dynamic = "force-static";

// Smaller logo-to-canvas ratio than the "any"-purpose icons: Android crops
// maskable icons to a shape (circle, squircle, ...) and only guarantees the
// inner ~80% safe zone survives, so the logo must sit well inside that.
export async function GET() {
  return renderIcon(512, 300);
}
