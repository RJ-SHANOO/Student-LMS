import { getTenantById } from "@/lib/services/super-admin";
import { toggleTenantStatusAction } from "../actions";

export default async function TenantOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getTenantById(id);

  return (
    <div className="max-w-lg rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Owner</dt>
          <dd className="text-foreground">{tenant.ownerName}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="text-foreground">{tenant.ownerEmail}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Phone</dt>
          <dd className="text-foreground">{tenant.ownerPhone}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Registered</dt>
          <dd className="text-foreground">{new Date(tenant.createdAt).toLocaleDateString()}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <span
              className={
                tenant.status === "active"
                  ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/10"
              }
            >
              {tenant.status}
            </span>
          </dd>
        </div>
      </dl>

      <form
        action={toggleTenantStatusAction.bind(
          null,
          tenant._id!.toString(),
          tenant.status === "active" ? "inactive" : "active"
        )}
        className="mt-5 border-t border-border pt-4"
      >
        <button type="submit" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          {tenant.status === "active" ? "Deactivate institute" : "Activate institute"}
        </button>
      </form>
    </div>
  );
}
