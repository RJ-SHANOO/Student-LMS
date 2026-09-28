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

export const createSuperAdminSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateTenantSchema = z.object({
  instituteName: z.string().trim().min(2, "Institute name is too short"),
  ownerName: z.string().trim().min(2, "Contact name is too short"),
  email: z.email("Invalid email address").toLowerCase(),
  phone: z.string().trim().min(7, "Invalid phone number"),
});

export const resetTenantPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});
