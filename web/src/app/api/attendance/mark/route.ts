import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { markAttendanceSchema } from "@/lib/validation/attendance";
import { markAttendance } from "@/lib/services/attendance";

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ["employee", "student"]);
    const body = await request.json().catch(() => null);
    const parsed = markAttendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const result = await markAttendance(
      { userId: auth.userId, tenantId: auth.tenantId! },
      parsed.data
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
