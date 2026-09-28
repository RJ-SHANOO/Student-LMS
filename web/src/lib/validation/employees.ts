import { z } from "zod";

const cnicSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\d{13}$/, "CNIC must be 13 digits"));

const objectIdField = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course");

// Form fields arrive as one or more checked checkboxes sharing the same
// "courseIds" name, so FormData.getAll("courseIds") produces string[] already —
// this just de-duplicates and validates each one looks like an ObjectId.
const courseIdsField = z
  .array(objectIdField)
  .optional()
  .transform((val) => (val ? Array.from(new Set(val)) : undefined))
  .optional();

export const createEmployeeSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  cnic: cnicSchema,
  // Not listed in CLAUDE.md's Employee fields, but required for the CNIC+DOB login
  // established in Phase 2 — every employee/student needs a DOB to log in.
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be in YYYY-MM-DD format"),
  department: z.string().trim().min(1, "Required").max(50, "Max 50 characters"),
  designation: z.string().trim().min(1, "Required").max(50, "Max 50 characters"),
  courseIds: courseIdsField,
});

export const updateEmployeeSchema = z.object({
  name: z.string().trim().min(2).optional(),
  department: z.string().trim().min(1).max(50).optional(),
  designation: z.string().trim().min(1).max(50).optional(),
  courseIds: courseIdsField,
  status: z.enum(["active", "inactive"]).optional(),
});

export const listEmployeesQuerySchema = z.object({
  status: z.enum(["active", "inactive"]).optional(),
  search: z.string().trim().min(1).optional(),
});
