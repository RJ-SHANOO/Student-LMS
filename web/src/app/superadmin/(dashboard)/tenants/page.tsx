import { listTenantsWithStats, getPlatformStats } from "@/lib/services/super-admin";
import { IconActivity, IconBuilding, IconEmployees } from "@/components/icons";
import { toggleTenantStatusAction } from "./actions";

export default async function SuperAdminTenantsPage() {
  const [tenants, stats] = await Promise.all([listTenantsWithStats(), getPlatformStats()]);

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">Tenants</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every institute registered on the platform.</p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Institutes" value={stats.tenantCount} icon={IconBuilding} />
        <StatCard label="Active Institutes" value={stats.activeTenantCount} icon={IconActivity} />
        <StatCard label="Total Users" value={stats.totalUsers} icon={IconEmployees} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Institute</th>
              <th className="px-4 py-2">Owner</th>
              <th className="px-4 py-2">Users</th>
              <th className="px-4 py-2">Registered</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tenants.map((tenant) => (
              <tr key={tenant._id!.toString()}>
                <td className="px-4 py-2 text-foreground">
                  {tenant.name}
                  <span className="ml-1 font-mono text-xs text-muted-foreground">{tenant.code}</span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">
                  {tenant.ownerName}
                  <span className="block text-xs text-muted-foreground">{tenant.ownerEmail}</span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{tenant.userCount}</td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(tenant.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <span
                    className={
                      tenant.status === "active"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/10"
                    }
                  >
                    {tenant.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <form
                    action={toggleTenantStatusAction.bind(
                      null,
                      tenant._id!.toString(),
                      tenant.status === "active" ? "inactive" : "active"
                    )}
                  >
                    <button type="submit" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                      {tenant.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No institutes registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: StatIcon,
}: {
  label: string;
  value: number;
  icon: (props: { className?: string }) => React.ReactElement;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className="rounded-md bg-accent-soft p-1.5 text-primary">
          <StatIcon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
