import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listMyAttendance, listStudentAttendanceForEmployee } from "@/lib/services/attendance";
import { getEmployee } from "@/lib/services/employees";
import type { AttendanceStatus } from "@/types/models";

const STATUS_STYLES: Record<string, string> = {
  present: "text-[var(--color-mod-attendance)] bg-[var(--color-mod-attendance-soft)]",
  late: "text-[var(--color-mod-fees)] bg-[var(--color-mod-fees-soft)]",
  absent: "text-red-600 bg-red-100",
};

export default async function PortalAttendanceReportPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string; status?: string }>;
}) {
  const session = await getSession();
  const { dateFrom, dateTo, status } = await searchParams;
  const tenantId = new ObjectId(session!.tenantId!);

  const filters: { dateFrom?: string; dateTo?: string; status?: AttendanceStatus } = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status: status === "present" || status === "late" || status === "absent" ? status : undefined,
  };

  const exportParams = new URLSearchParams();
  if (filters.dateFrom) exportParams.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) exportParams.set("dateTo", filters.dateTo);
  if (filters.status) exportParams.set("status", filters.status);

  if (session!.role === "employee") {
    const employee = await getEmployee(tenantId, session!.userId);
    const records = await listStudentAttendanceForEmployee(tenantId, employee.courseIds ?? [], filters);

    return (
      <div className="space-y-4">
        <Link href="/portal/attendance" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to check-in
        </Link>
        <h1 className="text-lg font-semibold text-foreground">Course Attendance</h1>
        {(employee.courseIds ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">You have no assigned courses yet.</p>
        )}

        <FilterForm dateFrom={dateFrom} dateTo={dateTo} status={status} exportHref={`/portal/attendance/report/export?${exportParams.toString()}`} />

        <ul className="space-y-2">
          {records.map((r) => (
            <li
              key={r._id!.toString()}
              className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 shadow-[var(--shadow-card)]"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{r.user.name}</p>
                <p className="text-xs text-muted-foreground">{r.date}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status] ?? ""}`}>
                {r.status}
              </span>
            </li>
          ))}
          {records.length === 0 && <p className="text-sm text-muted-foreground">No records for this filter.</p>}
        </ul>
      </div>
    );
  }

  const records = await listMyAttendance(tenantId, new ObjectId(session!.userId));
  const filtered = records.filter((r) => {
    if (filters.dateFrom && r.date < filters.dateFrom) return false;
    if (filters.dateTo && r.date > filters.dateTo) return false;
    if (filters.status && r.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <Link href="/portal/attendance" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to check-in
      </Link>
      <h1 className="text-lg font-semibold text-foreground">My Attendance</h1>

      <FilterForm dateFrom={dateFrom} dateTo={dateTo} status={status} exportHref={`/portal/attendance/report/export?${exportParams.toString()}`} />

      <ul className="space-y-2">
        {filtered.map((r) => (
          <li
            key={r.date}
            className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 shadow-[var(--shadow-card)]"
          >
            <p className="text-sm text-foreground">{r.date}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status] ?? ""}`}>
              {r.status}
            </span>
          </li>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No records for this filter.</p>}
      </ul>
    </div>
  );
}

function FilterForm({
  dateFrom,
  dateTo,
  status,
  exportHref,
}: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  exportHref: string;
}) {
  return (
    <form className="flex flex-wrap items-end gap-2" method="get">
      <div>
        <label className="block text-xs text-muted-foreground">From</label>
        <input type="date" name="dateFrom" defaultValue={dateFrom} className="rounded-md border border-border px-2 py-1.5 text-sm" />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground">To</label>
        <input type="date" name="dateTo" defaultValue={dateTo} className="rounded-md border border-border px-2 py-1.5 text-sm" />
      </div>
      <select name="status" defaultValue={status ?? ""} className="rounded-md border border-border px-2 py-1.5 text-sm">
        <option value="">All statuses</option>
        <option value="present">Present</option>
        <option value="late">Late</option>
        <option value="absent">Absent</option>
      </select>
      <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-background">
        Filter
      </button>
      <a href={exportHref} className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-background">
        Export CSV
      </a>
    </form>
  );
}
