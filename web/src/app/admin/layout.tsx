import Link from "next/link";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { tenantsCollection } from "@/lib/db/collections";
import { getSettings } from "@/lib/services/settings";
import { ThemeOverride } from "@/components/theme-script";
import { Logo } from "@/components/logo";
import { logoutAction } from "./actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.tenantId) {
    redirect("/login");
  }

  const tenantId = new ObjectId(session.tenantId);
  const tenants = await tenantsCollection();
  const [tenant, settings] = await Promise.all([tenants.findOne({ _id: tenantId }), getSettings(tenantId)]);
  if (!tenant || tenant.status !== "active") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <ThemeOverride preference={settings.themePreference ?? "system"} />
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="ml-1 text-sm text-muted-foreground">{tenant.name}</span>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/students" className="text-muted-foreground hover:text-foreground">
              Students
            </Link>
            <Link href="/admin/employees" className="text-muted-foreground hover:text-foreground">
              Employees
            </Link>
            <Link href="/admin/attendance" className="text-muted-foreground hover:text-foreground">
              Attendance
            </Link>
            <Link href="/admin/fees" className="text-muted-foreground hover:text-foreground">
              Fees
            </Link>
            <Link href="/admin/tasks" className="text-muted-foreground hover:text-foreground">
              Tasks
            </Link>
            <Link href="/admin/activity-log" className="text-muted-foreground hover:text-foreground">
              Activity
            </Link>
            <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">
              Settings
            </Link>
          </nav>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
            Log out
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
