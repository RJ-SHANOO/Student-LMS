import { z } from "zod";

export const updateSettingsSchema = z.object({
  instituteName: z.string().trim().min(2, "Institute name is too short").optional(),
  officeLat: z.number().min(-90).max(90).optional(),
  officeLng: z.number().min(-180).max(180).optional(),
  officeRadius: z.number().positive().max(5000).optional(),
  lateAfterTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Must be in HH:MM 24-hour format")
    .optional(),
  themePreference: z.enum(["light", "dark", "system"]).optional(),
});
