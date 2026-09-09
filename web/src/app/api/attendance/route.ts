import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { listAttendanceQuerySchema } from "@/lib/validation/attendance";
import { listAttendance } from "@/lib/services/attendance";

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const parsed = listAttendanceQuerySchema.safeParse({
      date: request.nextUrl.searchParams.get("date") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const records = await listAttendance(new ObjectId(auth.tenantId!), parsed.data);
    return NextResponse.json({ attendance: records });
  } catch (error) {
    return toErrorResponse(error);
  }
}
