import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantById } from "@/lib/services/super-admin";
import { AuthError } from "@/lib/auth";
import { TenantTabs } from "./tenant-tabs";

export default async function TenantDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let tenant;
  try {
    tenant = await getTenantById(id);
  } catch (error) {
    if (error instanceof AuthError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div>
      <Link href="/superadmin/tenants" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to tenants
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <h1 className="text-lg font-semibold text-foreground">{tenant.name}</h1>
        <span className="font-mono text-xs text-muted-foreground">{tenant.code}</span>
      </div>
      <TenantTabs tenantId={id} />
      <div className="mt-4">{children}</div>
    </div>
  );
}
