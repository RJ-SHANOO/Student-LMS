import { getTenantById } from "@/lib/services/super-admin";
import { toggleTenantStatusAction } from "../actions";
import { EditTenantForm } from "./edit-tenant-form";
import { ResetPasswordForm } from "./reset-password-form";

export default async function TenantOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await getTenantById(id);

  return (
    <div className="max-w-lg space-y-6">
      <div className="rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Status</h2>
          <span
            className={
              tenant.status === "active"
                ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/10"
            }
          >
            {tenant.status}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Registered {new Date(tenant.createdAt).toLocaleDateString()}
        </p>

        <form
          action={toggleTenantStatusAction.bind(
            null,
            tenant._id!.toString(),
            tenant.status === "active" ? "inactive" : "active"
          )}
          className="mt-4 border-t border-border pt-4"
        >
          <button type="submit" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            {tenant.status === "active"
              ? "Deactivate institute (blocks all of its employee/student logins too)"
              : "Activate institute"}
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
        <h2 className="text-sm font-medium text-foreground">Institute Details</h2>
        <div className="mt-4">
          <EditTenantForm
            tenantId={tenant._id!.toString()}
            instituteName={tenant.name}
            ownerName={tenant.ownerName}
            ownerEmail={tenant.ownerEmail}
            ownerPhone={tenant.ownerPhone}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface shadow-[var(--shadow-card)] p-6">
        <h2 className="text-sm font-medium text-foreground">Reset Login Password</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Sets a new password for this institute&apos;s login. The institute cannot see its current password.
        </p>
        <div className="mt-4">
          <ResetPasswordForm tenantId={tenant._id!.toString()} />
        </div>
      </div>
    </div>
  );
}
