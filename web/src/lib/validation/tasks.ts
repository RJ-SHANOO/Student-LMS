import { z } from "zod";

export const createTaskSchema = z.object({
  assignedTo: z.string().min(1, "Assignee is required"),
  title: z.string().trim().min(2, "Title is too short"),
  description: z.string().trim().max(2000).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format")
    .optional(),
});

export const taskStatusSchema = z.enum(["pending", "in-progress", "completed"]);

export const updateTaskSchema = z.object({
  status: taskStatusSchema.optional(),
  title: z.string().trim().min(2).optional(),
  description: z.string().trim().max(2000).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const listTasksQuerySchema = z.object({
  assignedTo: z.string().min(1).optional(),
  status: taskStatusSchema.optional(),
});
