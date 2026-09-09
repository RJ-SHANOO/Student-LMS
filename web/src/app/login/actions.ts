"use server";

import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { authenticateAdmin } from "@/lib/services/auth";
import { loginAdminSchema } from "@/lib/validation/auth";
import { createSession } from "@/lib/session";

export interface LoginState {
  error?: string;
}

export async function loginAdminAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginAdminSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid email and password." };
  }

  try {
    const { token } = await authenticateAdmin(parsed.data.email, parsed.data.password);
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
