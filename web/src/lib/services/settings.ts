import type { ObjectId } from "mongodb";
import { settingsCollection, tenantsCollection } from "@/lib/db/collections";
import { logActivity } from "@/lib/services/activity-log";
import type { Settings } from "@/types/models";
import type { updateSettingsSchema } from "@/lib/validation/settings";
import type { z } from "zod";

type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export const DEFAULT_OFFICE_RADIUS_METERS = 100;
export const DEFAULT_LATE_AFTER_TIME = "09:15";

export async function createDefaultSettings(tenantId: ObjectId, instituteName: string) {
  const settings = await settingsCollection();
  await settings.insertOne({
    tenantId,
    instituteName,
    officeRadius: DEFAULT_OFFICE_RADIUS_METERS,
    lateAfterTime: DEFAULT_LATE_AFTER_TIME,
    themePreference: "light",
  });
}

export async function getSettings(tenantId: ObjectId): Promise<Settings> {
  const settings = await settingsCollection();
  const existing = await settings.findOne({ tenantId });
  if (existing) return existing;

  // Defensive fallback for tenants created before Settings existed (Phase 1-4 test data).
  const fallback: Settings = {
    tenantId,
    instituteName: "",
    officeRadius: DEFAULT_OFFICE_RADIUS_METERS,
    lateAfterTime: DEFAULT_LATE_AFTER_TIME,
    themePreference: "light",
  };
  await settings.insertOne(fallback);
  return fallback;
}

export async function updateSettings(tenantId: ObjectId, input: UpdateSettingsInput, actorId: ObjectId) {
  const settings = await settingsCollection();
  const updated = await settings.findOneAndUpdate(
    { tenantId },
    { $set: input },
    { returnDocument: "after", upsert: true }
  );

  // Settings.instituteName and Tenant.name are kept in sync — the admin header
  // and tenant listings read Tenant.name, while Settings owns the editable copy.
  if (input.instituteName) {
    const tenants = await tenantsCollection();
    await tenants.updateOne({ _id: tenantId }, { $set: { name: input.instituteName } });
  }

  await logActivity({
    tenantId,
    userId: actorId,
    action: "settings_updated",
  });

  return updated!;
}
