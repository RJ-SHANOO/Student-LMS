"use server";

import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { authenticateAdmin, authenticateMember } from "@/lib/services/auth";
import { authenticateSuperAdmin } from "@/lib/services/super-admin";
import { loginAdminSchema, loginMemberSchema } from "@/lib/validation/auth";
import { superAdminLoginSchema } from "@/lib/validation/super-admin";
import { createSession } from "@/lib/session";

export interface LoginState {
  error?: string;
}

export async function loginSuperAdminAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
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

export async function loginInstituteAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
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

export async function loginEmployeeAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  return loginMember(formData, "employee");
}

export async function loginStudentAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  return loginMember(formData, "student");
}

async function loginMember(formData: FormData, role: "employee" | "student"): Promise<LoginState> {
  const parsed = loginMemberSchema.safeParse({
    cnic: formData.get("cnic"),
    dob: formData.get("dob"),
    role,
  });

  if (!parsed.success) {
    return { error: "Please enter a valid 13-digit CNIC and date of birth." };
  }

  try {
    const { token } = await authenticateMember(parsed.data.cnic, parsed.data.dob, parsed.data.role);
    await createSession(token);
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/portal");
}
