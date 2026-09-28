"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconAttendance, IconDashboard, IconTasks } from "./icons";

const NAV_ITEMS = [
  { href: "/portal", label: "Home", icon: IconDashboard, exact: true },
  { href: "/portal/attendance", label: "Attendance", icon: IconAttendance, exact: false },
  { href: "/portal/tasks", label: "Tasks", icon: IconTasks, exact: false },
] as const;

export function PortalNav() {
  const pathname = usePathname();

  return (
    <nav className="flex border-b border-border bg-surface px-2">
      {NAV_ITEMS.map(({ href, label, icon: ItemIcon, exact }) => {
        const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-xs"
            style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
          >
            <ItemIcon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
