import { listSuperAdmins } from "@/lib/services/super-admin";
import { NewAdminForm } from "./new-admin-form";

export default async function SuperAdminsPage() {
  const admins = await listSuperAdmins();

  return (
    <div>
      <h1 className="text-lg font-semibold text-foreground">Super Admins</h1>
      <p className="mt-1 text-sm text-muted-foreground">Platform-wide accounts with full tenant access.</p>

      <div className="mt-5 overflow-x-auto rounded-lg border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {admins.map((admin) => (
              <tr key={admin._id!.toString()}>
                <td className="px-4 py-2 text-foreground">{admin.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{admin.email}</td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(admin.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  No super admins yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <NewAdminForm />
    </div>
  );
}
