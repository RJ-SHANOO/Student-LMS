import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSuperAdminById } from "@/lib/services/super-admin";
import { ThemeOverride } from "@/components/theme-script";
import { logoutSuperAdminAction } from "./actions";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    redirect("/superadmin/login");
  }

  const account = await getSuperAdminById(session.userId);

  return (
    <div className="min-h-screen bg-background">
      <ThemeOverride preference={account.themePreference ?? "system"} />
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
        <div className="flex items-center gap-6">
          <div>
            <span className="font-semibold text-primary">SOIL</span>
            <span className="ml-2 text-sm text-muted-foreground">Super Admin</span>
          </div>
          <nav className="flex gap-4 text-sm">
            <Link href="/superadmin/tenants" className="text-muted-foreground hover:text-foreground">
              Tenants
            </Link>
            <Link href="/superadmin/settings" className="text-muted-foreground hover:text-foreground">
              Settings
            </Link>
          </nav>
        </div>
        <form action={logoutSuperAdminAction}>
          <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
            Log out
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
