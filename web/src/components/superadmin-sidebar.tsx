"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";
import { IconBuilding, IconLogOut, IconSettings } from "./icons";

const NAV_ITEMS = [
  { href: "/superadmin/tenants", label: "Tenants", icon: IconBuilding },
  { href: "/superadmin/settings", label: "Settings", icon: IconSettings },
];

export function SuperAdminSidebar({ logoutAction }: { logoutAction: () => Promise<void> }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <Logo size={32} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">SOIL</p>
          <p className="text-xs text-muted-foreground">Super admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV_ITEMS.map(({ href, label, icon: ItemIcon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={
                active
                  ? "flex items-center gap-3 rounded-md bg-accent-soft px-3 py-2 text-sm font-medium text-primary"
                  : "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              }
            >
              <ItemIcon />
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
