import { z } from "zod";

export const superAdminLoginSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const setTenantStatusSchema = z.object({
  status: z.enum(["active", "inactive"]),
});

export const updateSuperAdminSettingsSchema = z.object({
  themePreference: z.enum(["light", "dark", "system"]),
});
