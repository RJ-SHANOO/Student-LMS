"use server";

import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { authenticateMember } from "@/lib/services/auth";
import { loginMemberSchema } from "@/lib/validation/auth";
import { createSession } from "@/lib/session";

export interface LoginState {
  error?: string;
}

export async function loginMemberAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginMemberSchema.safeParse({
    cnic: formData.get("cnic"),
    dob: formData.get("dob"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid 13-digit CNIC and date of birth." };
  }

  try {
    const { token } = await authenticateMember(parsed.data.cnic, parsed.data.dob);
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
