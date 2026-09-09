"use server";

import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { authenticateSuperAdmin } from "@/lib/services/super-admin";
import { superAdminLoginSchema } from "@/lib/validation/super-admin";
import { createSession } from "@/lib/session";

export interface SuperAdminLoginState {
  error?: string;
}

export async function loginSuperAdminAction(
  _prevState: SuperAdminLoginState,
  formData: FormData
): Promise<SuperAdminLoginState> {
  const parsed = superAdminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid email and password." };
  }

  try {
    const { token } = await authenticateSuperAdmin(parsed.data.email, parsed.data.password);
    await createSession(token);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/superadmin/tenants");
}
