import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { listMyAttendance } from "@/lib/services/attendance";

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["employee", "student"]);
    const attendance = await listMyAttendance(new ObjectId(auth.tenantId!), new ObjectId(auth.userId));
    return NextResponse.json({ attendance });
  } catch (error) {
    return toErrorResponse(error);
  }
}
