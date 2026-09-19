"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { segment: "", label: "Overview" },
  { segment: "students", label: "Students" },
  { segment: "employees", label: "Employees" },
  { segment: "attendance", label: "Attendance" },
  { segment: "fees", label: "Fees" },
];

export function TenantTabs({ tenantId }: { tenantId: string }) {
  const pathname = usePathname();
  const base = `/superadmin/tenants/${tenantId}`;

  return (
    <nav className="mt-4 flex gap-1 border-b border-border">
      {TABS.map(({ segment, label }) => {
        const href = segment ? `${base}/${segment}` : base;
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={
              active
                ? "border-b-2 border-primary px-3 py-2 text-sm font-medium text-primary"
                : "border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
