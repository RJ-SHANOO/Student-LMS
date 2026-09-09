"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { updateSuperAdminTheme } from "@/lib/services/super-admin";
import { updateSuperAdminSettingsSchema } from "@/lib/validation/super-admin";

export interface SuperAdminSettingsState {
  error?: string;
  success?: boolean;
}

export async function updateSuperAdminSettingsAction(
  _prevState: SuperAdminSettingsState,
  formData: FormData
): Promise<SuperAdminSettingsState> {
  const session = await getSession();
  if (!session || session.role !== "superadmin") {
    redirect("/superadmin/login");
  }

  const parsed = updateSuperAdminSettingsSchema.safeParse({
    themePreference: formData.get("themePreference") || undefined,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid input" };
  }

  await updateSuperAdminTheme(session.userId, parsed.data.themePreference);
  revalidatePath("/superadmin/settings");
  return { success: true };
}
