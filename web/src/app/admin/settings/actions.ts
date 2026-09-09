"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { updateSettings } from "@/lib/services/settings";
import { updateSettingsSchema } from "@/lib/validation/settings";

export interface SettingsState {
  error?: string;
  success?: boolean;
}

export async function updateSettingsAction(
  _prevState: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.tenantId) {
    redirect("/login");
  }

  const parsed = updateSettingsSchema.safeParse({
    instituteName: formData.get("instituteName") || undefined,
    officeLat: Number(formData.get("officeLat")),
    officeLng: Number(formData.get("officeLng")),
    officeRadius: Number(formData.get("officeRadius")),
    lateAfterTime: formData.get("lateAfterTime"),
    themePreference: formData.get("themePreference") || undefined,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid input" };
  }

  await updateSettings(new ObjectId(session.tenantId), parsed.data, new ObjectId(session.userId));
  revalidatePath("/admin/settings");
  return { success: true };
}
