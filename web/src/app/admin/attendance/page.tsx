import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listEmployeeAttendanceForInstitute } from "@/lib/services/attendance";
import { listEmployees } from "@/lib/services/employees";
import { ModuleIcon } from "@/components/module-icon";
import { IconAttendance } from "@/components/icons";
import type { AttendanceStatus } from "@/types/models";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string; status?: string; employeeId?: string }>;
}) {
  const session = await getSession();
  const { dateFrom, dateTo, status, employeeId } = await searchParams;
  const tenantId = new ObjectId(session!.tenantId!);

  const filters: { dateFrom?: string; dateTo?: string; status?: AttendanceStatus; employeeId?: string } = {
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    status: status === "present" || status === "late" || status === "absent" ? status : undefined,
    employeeId: employeeId || undefined,
  };

  const [records, employees] = await Promise.all([
    listEmployeeAttendanceForInstitute(tenantId, filters),
    listEmployees(tenantId),
  ]);

  const exportParams = new URLSearchParams();
  if (filters.dateFrom) exportParams.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) exportParams.set("dateTo", filters.dateTo);
  if (filters.status) exportParams.set("status", filters.status);
  if (filters.employeeId) exportParams.set("employeeId", filters.employeeId);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ModuleIcon mod="attendance" icon={IconAttendance} />
          <h1 className="text-lg font-semibold text-foreground">Employee Attendance</h1>
        </div>
        <Link
          href="/admin/attendance/display"
          className="rounded-md btn-gradient px-4 py-2 text-sm font-medium text-white"
        >
          Show Check-in QR
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Attendance report for employees. Student attendance is reported by their course instructors.
      </p>

      <form className="mt-4 flex flex-wrap items-end gap-2" method="get">
        <div>
          <label className="block text-xs text-muted-foreground">From</label>
          <input
            type="date"
            name="dateFrom"
            defaultValue={dateFrom}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground">To</label>
          <input
            type="date"
            name="dateTo"
            defaultValue={dateTo}
            className="rounded-md border border-border px-3 py-1.5 text-sm"
          />
        </div>
        <select
          name="employeeId"
          defaultValue={employeeId ?? ""}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          <option value="">All employees</option>
          {employees.map((e) => (
            <option key={e._id!.toString()} value={e._id!.toString()}>
              {e.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="absent">Absent</option>
        </select>
        <button type="submit" className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5">
          Filter
        </button>
        <a
          href={`/admin/attendance/export?${exportParams.toString()}`}
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
        >
          Export CSV
        </a>
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Photo</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Check-in</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr key={record._id!.toString()}>
                <td className="px-4 py-2">
                  {record.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- base64 data URI, not an optimizable remote image
                    <img
                      src={record.photoUrl}
                      alt={`${record.user.name} check-in selfie`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{record.date}</td>
                <td className="px-4 py-2 text-foreground">{record.user.name}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : "—"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={
                      record.status === "present"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : record.status === "late"
                          ? "rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          : "rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/40 dark:text-red-300"
                    }
                  >
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No attendance records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
