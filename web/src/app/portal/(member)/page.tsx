import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listMyAttendance, todayDateString } from "@/lib/services/attendance";
import { IconAttendance } from "@/components/icons";

const STATUS_STYLES: Record<string, string> = {
  present: "text-[var(--color-mod-attendance)] bg-[var(--color-mod-attendance-soft)]",
  late: "text-[var(--color-mod-fees)] bg-[var(--color-mod-fees-soft)]",
  absent: "text-red-600 bg-red-100",
};

export default async function PortalHomePage() {
  const session = await getSession();
  const tenantId = new ObjectId(session!.tenantId!);
  const userId = new ObjectId(session!.userId);

  const records = await listMyAttendance(tenantId, userId);
  const today = todayDateString(new Date());
  const todayRecord = records.find((r) => r.date === today);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-lg"
            style={{ backgroundColor: "var(--color-mod-attendance-soft)", color: "var(--color-mod-attendance)" }}
          >
            <IconAttendance />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Today&apos;s Attendance</p>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
        </div>

        {todayRecord ? (
          <div className="mt-4 flex items-center justify-between rounded-md border border-border px-3 py-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[todayRecord.status] ?? ""}`}
            >
              {todayRecord.status}
            </span>
            <span className="text-xs text-muted-foreground">
              Checked in{" "}
              {todayRecord.checkInTime
                ? new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : ""}
            </span>
          </div>
        ) : (
          <Link
            href="/portal/attendance"
            className="mt-4 flex w-full items-center justify-center rounded-md btn-gradient px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            Check In
          </Link>
        )}
      </div>

      {records.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <p className="mb-3 text-sm font-medium text-foreground">Recent Attendance</p>
          <ul className="space-y-2">
            {records.slice(0, 7).map((r) => (
              <li key={r.date} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{r.date}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status] ?? ""}`}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
