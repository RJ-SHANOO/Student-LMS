"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import {
  IconActivity,
  IconAttendance,
  IconDashboard,
  IconEmployees,
  IconFees,
  IconLogOut,
  IconSettings,
  IconStudents,
  IconTasks,
} from "./icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: IconDashboard, exact: true, mod: null },
  { href: "/admin/students", label: "Students", icon: IconStudents, exact: false, mod: "students" },
  { href: "/admin/employees", label: "Employees", icon: IconEmployees, exact: false, mod: "employees" },
  { href: "/admin/attendance", label: "Attendance", icon: IconAttendance, exact: false, mod: "attendance" },
  { href: "/admin/fees", label: "Fees", icon: IconFees, exact: false, mod: "fees" },
  { href: "/admin/tasks", label: "Tasks", icon: IconTasks, exact: false, mod: "tasks" },
  { href: "/admin/activity-log", label: "Activity", icon: IconActivity, exact: false, mod: "activity" },
  { href: "/admin/settings", label: "Settings", icon: IconSettings, exact: false, mod: "settings" },
] as const;

export function AdminSidebar({
  tenantName,
  logoutAction,
}: {
  tenantName: string;
  logoutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <Logo size={32} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{tenantName}</p>
          <p className="text-xs text-muted-foreground">Admin panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV_ITEMS.map(({ href, label, icon: ItemIcon, exact, mod }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          const fg = mod ? `var(--color-mod-${mod})` : "var(--color-primary)";
          const soft = mod ? `var(--color-mod-${mod}-soft)` : "var(--color-accent-soft)";
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
                  : "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              }
              style={active ? { backgroundColor: soft, color: fg } : undefined}
            >
              <ItemIcon style={{ color: active ? fg : undefined }} />
              {label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction} className="border-t border-border p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          <IconLogOut />
          Log out
        </button>
      </form>
    </aside>
  );
}
