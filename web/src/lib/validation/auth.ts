import { z } from "zod";

export const registerSchema = z.object({
  instituteName: z.string().trim().min(2, "Institute name is too short"),
  ownerName: z.string().trim().min(2, "Owner name is too short"),
  email: z.email("Invalid email address").toLowerCase(),
  phone: z.string().trim().min(7, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginAdminSchema = z.object({
  email: z.email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

const cnicSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\d{13}$/, "CNIC must be 13 digits"));

export const loginMemberSchema = z.object({
  cnic: cnicSchema,
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be in YYYY-MM-DD format"),
});
