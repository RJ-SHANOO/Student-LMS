import { z } from "zod";

export const taskAudienceTypeSchema = z.enum(["course", "department"]);

export const createTaskSchema = z.object({
  audienceType: taskAudienceTypeSchema,
  audienceValue: z.string().trim().min(1, "Required").max(50, "Max 50 characters"),
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

export const taskStatusSchema = z.enum(["pending", "in-progress", "completed"]);

export const updateTaskCompletionSchema = z.object({
  status: taskStatusSchema,
  note: z.string().trim().max(1000).optional(),
});

export const listTasksQuerySchema = z.object({
  audienceType: taskAudienceTypeSchema.optional(),
});
