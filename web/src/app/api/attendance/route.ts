import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { listEmployeeAttendanceQuerySchema } from "@/lib/validation/attendance";
import { listEmployeeAttendanceForInstitute } from "@/lib/services/attendance";

// Institute-only: the employee attendance report (never students — see CLAUDE.md Section 6).
export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const parsed = listEmployeeAttendanceQuerySchema.safeParse({
      dateFrom: request.nextUrl.searchParams.get("dateFrom") ?? undefined,
      dateTo: request.nextUrl.searchParams.get("dateTo") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      employeeId: request.nextUrl.searchParams.get("employeeId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const records = await listEmployeeAttendanceForInstitute(new ObjectId(auth.tenantId!), parsed.data);
    return NextResponse.json({ attendance: records });
  } catch (error) {
    return toErrorResponse(error);
  }
}
