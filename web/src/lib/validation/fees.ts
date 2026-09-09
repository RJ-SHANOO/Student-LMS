import { z } from "zod";

export const createFeeSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  totalFee: z.number().positive("Total fee must be greater than 0"),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format"),
});

export const recordPaymentSchema = z.object({
  amount: z.number().positive("Payment amount must be greater than 0"),
});

export const listFeesQuerySchema = z.object({
  studentId: z.string().min(1).optional(),
  status: z.enum(["paid", "partial", "unpaid"]).optional(),
});
