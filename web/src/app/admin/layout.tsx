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
    redirect("/login?role=institute");
  }

  const tenantId = new ObjectId(session.tenantId);
  const tenants = await tenantsCollection();
  const tenant = await tenants.findOne({ _id: tenantId });
  if (!tenant || tenant.status !== "active") {
    redirect("/login?role=institute");
  }

  // Only looked up once the tenant is confirmed to exist — getSettings()
  // auto-creates a Settings doc when one is missing, which must never happen
  // for a tenantId that no longer exists (e.g. a stale session after delete).
  const settings = await getSettings(tenantId);

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
