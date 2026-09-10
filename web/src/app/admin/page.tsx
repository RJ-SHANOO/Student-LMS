import Link from "next/link";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { listStudents } from "@/lib/services/students";
import { listEmployees } from "@/lib/services/employees";
import { listFees } from "@/lib/services/fees";
import { listAttendance, todayDateString } from "@/lib/services/attendance";
import { listActivityLog } from "@/lib/services/activity-log";
import { IconActivity, IconAttendance, IconEmployees, IconFees, IconStudents } from "@/components/icons";

function humanizeAction(action: string) {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const currency = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });

export default async function AdminDashboardPage() {
  const session = await getSession();
  const tenantId = new ObjectId(session!.tenantId!);

  const [students, employees, fees, todayAttendance, recentActivity] = await Promise.all([
    listStudents(tenantId, { status: "active" }),
    listEmployees(tenantId, { status: "active" }),
    listFees(tenantId),
    listAttendance(tenantId, { date: todayDateString(new Date()) }),
    listActivityLog(tenantId, { limit: 6 }),
  ]);

  const outstandingFees = fees.filter((fee) => fee.status !== "paid");
  const outstandingAmount = outstandingFees.reduce((sum, fee) => sum + fee.remainingAmount, 0);
  const presentToday = todayAttendance.filter((r) => r.status === "present" || r.status === "late").length;

  const stats = [
    {
      label: "Active Students",
      value: students.length,
      href: "/admin/students",
      icon: IconStudents,
    },
    {
      label: "Active Employees",
      value: employees.length,
      href: "/admin/employees",
      icon: IconEmployees,
    },
    {
      label: "Present Today",
      value: presentToday,
      href: "/admin/attendance",
      icon: IconAttendance,
    },
    {
      label: "Outstanding Fees",
      value: outstandingFees.length,
      sublabel: outstandingFees.length > 0 ? `${currency.format(outstandingAmount)} due` : undefined,
      href: "/admin/fees",
      icon: IconFees,
    },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">A quick look at your institute today.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, sublabel, href, icon: StatIcon }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition-colors hover:border-accent"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
              <span className="rounded-md bg-accent-soft p-1.5 text-primary">
                <StatIcon className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
            {sublabel && <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>}
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <IconActivity className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">Recent Activity</h2>
          </div>
          <Link href="/admin/activity-log" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {recentActivity.map((entry) => (
            <li key={entry._id!.toString()} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <span className="text-foreground">{humanizeAction(entry.action)}</span>
                {entry.user?.name && <span className="text-muted-foreground"> · {entry.user.name}</span>}
              </div>
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </li>
          ))}
          {recentActivity.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">No activity recorded yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
