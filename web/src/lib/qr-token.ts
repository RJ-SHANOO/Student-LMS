import jwt from "jsonwebtoken";
import { AuthError } from "@/lib/auth";

const JWT_SECRET = process.env.JWT_SECRET as string;
const QR_TOKEN_TTL_SECONDS = 45;

interface QrTokenPayload {
  tenantId: string;
  purpose: "attendance-qr";
}

// Distinct from session JWTs (different payload shape, entirely different
// lifetime) even though it reuses the same signing secret. The `purpose`
// claim keeps the two from ever being confused for one another.
export function generateQrToken(tenantId: string) {
  const token = jwt.sign({ tenantId, purpose: "attendance-qr" } satisfies QrTokenPayload, JWT_SECRET, {
    expiresIn: QR_TOKEN_TTL_SECONDS,
  });
  return { token, expiresIn: QR_TOKEN_TTL_SECONDS };
}

export function verifyQrToken(token: string): QrTokenPayload {
  let payload: unknown;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    throw new AuthError("QR code has expired. Please scan the current code.", 400);
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    (payload as Partial<QrTokenPayload>).purpose !== "attendance-qr"
  ) {
    throw new AuthError("Invalid QR code", 400);
  }

  return payload as QrTokenPayload;
}
