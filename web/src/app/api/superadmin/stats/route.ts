import { NextRequest, NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { getPlatformStats } from "@/lib/services/super-admin";

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ["superadmin"]);
    const stats = await getPlatformStats();
    return NextResponse.json({ stats });
  } catch (error) {
    return toErrorResponse(error);
  }
}
