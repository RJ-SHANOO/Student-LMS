import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listAttendance } from "@/lib/services/attendance";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string }>;
}) {
  const session = await getSession();
  const { date, status } = await searchParams;

  const records = await listAttendance(new ObjectId(session!.tenantId!), {
    date: date || undefined,
    status: status === "present" || status === "late" || status === "absent" ? status : undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">All Attendance</h1>
        <Link
          href="/admin/attendance/display"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Show Check-in QR
        </Link>
      </div>

      <form className="mt-4 flex gap-2" method="get">
        <input
          type="date"
          name="date"
          defaultValue={date}
          className="rounded-md border border-border px-3 py-1.5 text-sm"
        />
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
      </form>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Photo</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
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
                <td className="px-4 py-2 text-muted-foreground">{record.user.role}</td>
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
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
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
