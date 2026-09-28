import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listMyAttendance, listStudentAttendanceForEmployee } from "@/lib/services/attendance";
import { listCourseAttendanceQuerySchema } from "@/lib/validation/attendance";
import { getEmployee } from "@/lib/services/employees";
import { toCsv } from "@/lib/csv";

// Cookie-session-authenticated so a plain <a href> download link works without extra JS.
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || !["employee", "student"].includes(session.role) || !session.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = listCourseAttendanceQuerySchema.safeParse({
    dateFrom: request.nextUrl.searchParams.get("dateFrom") ?? undefined,
    dateTo: request.nextUrl.searchParams.get("dateTo") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  const tenantId = new ObjectId(session.tenantId);

  if (session.role === "employee") {
    const employee = await getEmployee(tenantId, session.userId);
    const records = await listStudentAttendanceForEmployee(tenantId, employee.courseIds ?? [], parsed.data);
    const csv = toCsv(
      ["Date", "Student", "Status"],
      records.map((r) => [r.date, r.user.name, r.status])
    );
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="course-attendance-${Date.now()}.csv"`,
      },
    });
  }

  const records = await listMyAttendance(tenantId, new ObjectId(session.userId));
  const filtered = records.filter((r) => {
    if (parsed.data.dateFrom && r.date < parsed.data.dateFrom) return false;
    if (parsed.data.dateTo && r.date > parsed.data.dateTo) return false;
    if (parsed.data.status && r.status !== parsed.data.status) return false;
    return true;
  });
  const csv = toCsv(
    ["Date", "Status"],
    filtered.map((r) => [r.date, r.status])
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="my-attendance-${Date.now()}.csv"`,
    },
  });
}
