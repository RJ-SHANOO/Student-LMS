"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { deleteTenant, getTenantById, resetTenantPassword, setTenantStatus, updateTenant } from "@/lib/services/super-admin";
import { registerTenant } from "@/lib/services/auth";
import { registerSchema } from "@/lib/validation/auth";
import { resetTenantPasswordSchema, updateTenantSchema } from "@/lib/validation/super-admin";
import { AuthError } from "@/lib/auth";

async function requireSuperAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    redirect("/login?role=superadmin");
  }
  return session;
}

export async function toggleTenantStatusAction(id: string, nextStatus: "active" | "inactive") {
  await requireSuperAdminSession();
  await setTenantStatus(id, nextStatus);
  revalidatePath("/superadmin/tenants");
}

export interface CreateTenantState {
  error?: string;
}

export async function createTenantAction(
  _prevState: CreateTenantState,
  formData: FormData
): Promise<CreateTenantState> {
  await requireSuperAdminSession();

  const parsed = registerSchema.safeParse({
    instituteName: formData.get("instituteName"),
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  try {
    await registerTenant(parsed.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/superadmin/tenants");
  redirect("/superadmin/tenants");
}

export interface UpdateTenantState {
  error?: string;
  success?: boolean;
}

export async function updateTenantAction(
  id: string,
  _prevState: UpdateTenantState,
  formData: FormData
): Promise<UpdateTenantState> {
  await requireSuperAdminSession();

  const parsed = updateTenantSchema.safeParse({
    instituteName: formData.get("instituteName"),
    ownerName: formData.get("ownerName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  try {
    await updateTenant(id, parsed.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/superadmin/tenants/${id}`);
  revalidatePath("/superadmin/tenants");
  return { success: true };
}

export interface ResetTenantPasswordState {
  error?: string;
  success?: boolean;
}

export async function resetTenantPasswordAction(
  id: string,
  _prevState: ResetTenantPasswordState,
  formData: FormData
): Promise<ResetTenantPasswordState> {
  await requireSuperAdminSession();

  const parsed = resetTenantPasswordSchema.safeParse({ password: formData.get("password") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Password must be at least 8 characters." };
  }

  try {
    await resetTenantPassword(id, parsed.data.password);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  return { success: true };
}

export interface DeleteTenantState {
  error?: string;
}

export async function deleteTenantAction(
  id: string,
  _prevState: DeleteTenantState,
  formData: FormData
): Promise<DeleteTenantState> {
  await requireSuperAdminSession();

  const tenant = await getTenantById(id);
  const confirmation = formData.get("confirmName");
  if (confirmation !== tenant.name) {
    return { error: "Institute name didn't match. Type it exactly to confirm deletion." };
  }

  try {
    await deleteTenant(id);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/superadmin/tenants");
  redirect("/superadmin/tenants");
}
