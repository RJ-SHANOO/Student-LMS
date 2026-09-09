import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { listActivityLog } from "@/lib/services/activity-log";

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const userId = request.nextUrl.searchParams.get("userId") ?? undefined;
    const entries = await listActivityLog(new ObjectId(auth.tenantId!), { userId });
    return NextResponse.json({ entries });
  } catch (error) {
    return toErrorResponse(error);
  }
}
