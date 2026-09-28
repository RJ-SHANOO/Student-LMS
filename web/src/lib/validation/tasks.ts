import { z } from "zod";

const objectIdField = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createTaskSchema = z.object({
  courseId: objectIdField,
  title: z.string().trim().min(2, "Title is too short"),
  description: z.string().trim().max(2000).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format")
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(2).optional(),
  description: z.string().trim().max(2000).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const reviewSubmissionSchema = z.object({
  studentId: objectIdField,
  remarks: z.string().trim().max(2000).optional(),
  marks: z.coerce.number().min(0).max(1000).optional(),
});

export const listTasksQuerySchema = z.object({
  courseId: objectIdField.optional(),
});
