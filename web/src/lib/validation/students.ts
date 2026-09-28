import { z } from "zod";

const cnicSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\d{13}$/, "CNIC must be 13 digits"));

const codeField = z.string().trim().min(1, "Required").max(10, "Max 10 characters");
const objectIdField = z.string().regex(/^[0-9a-fA-F]{24}$/, "Please choose a course");

export const createStudentSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  cnic: cnicSchema,
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "DOB must be in YYYY-MM-DD format"),
  department: codeField,
  courseId: objectIdField,
  batch: codeField,
});

export const updateStudentSchema = z.object({
  name: z.string().trim().min(2).optional(),
  department: codeField.optional(),
  courseId: objectIdField.optional(),
  batch: codeField.optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const listStudentsQuerySchema = z.object({
  status: z.enum(["active", "inactive"]).optional(),
  search: z.string().trim().min(1).optional(),
});
