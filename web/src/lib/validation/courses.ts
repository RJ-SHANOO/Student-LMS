import { z } from "zod";

const codeField = z
  .string()
  .trim()
  .min(1, "Required")
  .max(10, "Max 10 characters")
  .transform((v) => v.toUpperCase());

export const createCourseSchema = z.object({
  name: z.string().trim().min(2, "Course name is too short"),
  code: codeField,
  duration: z.string().trim().max(50, "Max 50 characters").optional(),
});

export const updateCourseSchema = z.object({
  name: z.string().trim().min(2).optional(),
  duration: z.string().trim().max(50).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export const listCoursesQuerySchema = z.object({
  status: z.enum(["active", "inactive"]).optional(),
});
