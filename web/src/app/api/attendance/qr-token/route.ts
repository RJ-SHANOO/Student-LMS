import { NextRequest, NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { generateQrToken } from "@/lib/qr-token";

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const { token, expiresIn } = generateQrToken(auth.tenantId!);
    return NextResponse.json({ token, expiresIn });
  } catch (error) {
    return toErrorResponse(error);
  }
}
