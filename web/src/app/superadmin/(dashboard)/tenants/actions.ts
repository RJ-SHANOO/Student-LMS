"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { setTenantStatus } from "@/lib/services/super-admin";

async function requireSuperAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    redirect("/superadmin/login");
  }
  return session;
}

export async function toggleTenantStatusAction(id: string, nextStatus: "active" | "inactive") {
  await requireSuperAdminSession();
  await setTenantStatus(id, nextStatus);
  revalidatePath("/superadmin/tenants");
}
