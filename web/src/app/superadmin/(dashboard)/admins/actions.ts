"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { createSuperAdmin } from "@/lib/services/super-admin";
import { createSuperAdminSchema } from "@/lib/validation/super-admin";
import { AuthError } from "@/lib/auth";

async function requireSuperAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    redirect("/superadmin/login");
  }
  return session;
}

export interface CreateSuperAdminState {
  error?: string;
  success?: boolean;
}

export async function createSuperAdminAction(
  _prevState: CreateSuperAdminState,
  formData: FormData
): Promise<CreateSuperAdminState> {
  await requireSuperAdminSession();

  const parsed = createSuperAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  try {
    await createSuperAdmin(parsed.data);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/superadmin/admins");
  return { success: true };
}
