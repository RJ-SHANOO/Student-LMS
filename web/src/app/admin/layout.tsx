import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/session";
import { tenantsCollection } from "@/lib/db/collections";
import { getSettings } from "@/lib/services/settings";
import { ThemeOverride } from "@/components/theme-script";
import { AdminSidebar } from "@/components/admin-sidebar";
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
    <div className="flex min-h-screen bg-background">
      <ThemeOverride preference={settings.themePreference ?? "light"} />
      <AdminSidebar tenantName={tenant.name} logoutAction={logoutAction} />
      <main className="min-w-0 flex-1 overflow-x-hidden px-8 py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
