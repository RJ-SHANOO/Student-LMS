"use server";

import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { registerTenant } from "@/lib/services/auth";
import { registerSchema } from "@/lib/validation/auth";
import { createSession } from "@/lib/session";

export interface RegisterState {
  error?: string;
}

export async function registerTenantAction(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
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
    const { token } = await registerTenant(parsed.data);
    await createSession(token);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/admin/students");
}
