import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { listCourseAttendanceQuerySchema } from "@/lib/validation/attendance";
import { listStudentAttendanceForEmployee } from "@/lib/services/attendance";
import { getEmployee } from "@/lib/services/employees";

// Employee-only: attendance of students enrolled in the course(s) this employee is assigned to.
export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["employee"]);
    const parsed = listCourseAttendanceQuerySchema.safeParse({
      dateFrom: request.nextUrl.searchParams.get("dateFrom") ?? undefined,
      dateTo: request.nextUrl.searchParams.get("dateTo") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const tenantId = new ObjectId(auth.tenantId!);
    const employee = await getEmployee(tenantId, auth.userId);
    const records = await listStudentAttendanceForEmployee(tenantId, employee.courseIds ?? [], parsed.data);
    return NextResponse.json({ attendance: records });
  } catch (error) {
    return toErrorResponse(error);
  }
}
