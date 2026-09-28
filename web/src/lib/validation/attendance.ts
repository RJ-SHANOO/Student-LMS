import { z } from "zod";

export const markAttendanceSchema = z.object({
  qrToken: z.string().min(1, "QR token is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  // Live front-camera selfie as a data URI, captured automatically by the app
  // (never a manual upload) — the third and final check per CLAUDE.md Section 6.
  // ~2MB base64 ceiling keeps a compressed JPEG well within MongoDB's 16MB doc limit.
  photo: z
    .string()
    .min(1, "Photo is required")
    .max(2_000_000, "Photo is too large")
    .regex(/^data:image\/(jpeg|jpg|png);base64,/, "Photo must be a base64 image data URI"),
});

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");
const objectIdField = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

// Institute's employee attendance report: date range + status + a specific employee.
export const listEmployeeAttendanceQuerySchema = z.object({
  dateFrom: dateField.optional(),
  dateTo: dateField.optional(),
  status: z.enum(["present", "late", "absent"]).optional(),
  employeeId: objectIdField.optional(),
});

// An employee's own report: students in their course(s), date range + status.
export const listCourseAttendanceQuerySchema = z.object({
  dateFrom: dateField.optional(),
  dateTo: dateField.optional(),
  status: z.enum(["present", "late", "absent"]).optional(),
});
