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

export const listAttendanceQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  status: z.enum(["present", "late", "absent"]).optional(),
});
