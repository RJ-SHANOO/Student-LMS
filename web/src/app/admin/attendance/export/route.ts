import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listEmployeeAttendanceForInstitute } from "@/lib/services/attendance";
import { listEmployeeAttendanceQuerySchema } from "@/lib/validation/attendance";
import { toCsv } from "@/lib/csv";

// Cookie-session-authenticated (not the Bearer-token /api/* layer) so a plain
// <a href> download link from the report page works without extra JS.
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = listEmployeeAttendanceQuerySchema.safeParse({
    dateFrom: request.nextUrl.searchParams.get("dateFrom") ?? undefined,
    dateTo: request.nextUrl.searchParams.get("dateTo") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
    employeeId: request.nextUrl.searchParams.get("employeeId") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid filters" }, { status: 400 });
  }

  const records = await listEmployeeAttendanceForInstitute(new ObjectId(session.tenantId), parsed.data);
  const csv = toCsv(
    ["Date", "Name", "Check-in Time", "Status"],
    records.map((r) => [r.date, r.user.name, r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString() : "", r.status])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="employee-attendance-${Date.now()}.csv"`,
    },
  });
}
