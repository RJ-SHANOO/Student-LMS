import Link from "next/link";
import { NewTenantForm } from "./new-tenant-form";

export default function NewTenantPage() {
  return (
    <div>
      <Link href="/superadmin/tenants" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to tenants
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-foreground">Add Institute</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create a new tenant workspace and its admin account.</p>
      <NewTenantForm />
    </div>
  );
}
