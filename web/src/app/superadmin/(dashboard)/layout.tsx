import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getSuperAdminById } from "@/lib/services/super-admin";
import { ThemeOverride } from "@/components/theme-script";
import { SuperAdminSidebar } from "@/components/superadmin-sidebar";
import { logoutSuperAdminAction } from "./actions";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    redirect("/superadmin/login");
  }

  const account = await getSuperAdminById(session.userId);

  return (
    <div className="flex min-h-screen bg-background">
      <ThemeOverride preference={account.themePreference ?? "light"} />
      <SuperAdminSidebar logoutAction={logoutSuperAdminAction} />
      <main className="min-w-0 flex-1 overflow-x-hidden px-8 py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
