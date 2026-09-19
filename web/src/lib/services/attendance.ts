import { ObjectId } from "mongodb";
import { attendanceCollection } from "@/lib/db/collections";
import { AuthError } from "@/lib/auth";
import { verifyQrToken } from "@/lib/qr-token";
import { distanceMeters } from "@/lib/geo";
import { getSettings } from "@/lib/services/settings";
import { logActivity } from "@/lib/services/activity-log";
import type { z } from "zod";
import type { markAttendanceSchema, listAttendanceQuerySchema } from "@/lib/validation/attendance";

type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
type ListAttendanceQuery = z.infer<typeof listAttendanceQuerySchema>;

// Server's local wall-clock date/time is used for "today" and the late-cutoff
// comparison. This is fine as long as the server and the tenant's institute
// are in the same timezone — revisit (add a tenant timezone setting) before
// deploying somewhere the server clock won't match the institute's local time.
export function todayDateString(now: Date) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function minutesSinceMidnight(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function parseHHMM(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export async function markAttendance(
  auth: { userId: string; tenantId: string },
  input: MarkAttendanceInput
) {
  const { tenantId: qrTenantId } = verifyQrToken(input.qrToken);
  if (qrTenantId !== auth.tenantId) {
    throw new AuthError("Invalid QR code", 400);
  }

  const settings = await getSettings(new ObjectId(auth.tenantId));
  if (settings.officeLat === undefined || settings.officeLng === undefined) {
    throw new AuthError("Office location has not been configured yet. Contact your admin.", 400);
  }

  const radius = settings.officeRadius ?? 100;
  const distance = distanceMeters(input.latitude, input.longitude, settings.officeLat, settings.officeLng);
  if (distance > radius) {
    throw new AuthError(
      `You are ${Math.round(distance)}m from the institute, outside the ${radius}m allowed range`,
      403
    );
  }

  const now = new Date();
  const date = todayDateString(now);

  const attendance = await attendanceCollection();
  const existing = await attendance.findOne({
    tenantId: new ObjectId(auth.tenantId),
    userId: new ObjectId(auth.userId),
    date,
  });
  if (existing) {
    throw new AuthError("Attendance already marked for today", 409);
  }

  const lateAfter = settings.lateAfterTime ?? "09:15";
  const status: "present" | "late" = minutesSinceMidnight(now) > parseHHMM(lateAfter) ? "late" : "present";

  await attendance.insertOne({
    tenantId: new ObjectId(auth.tenantId),
    userId: new ObjectId(auth.userId),
    date,
    checkInTime: now,
    latitude: input.latitude,
    longitude: input.longitude,
    photoUrl: input.photo,
    qrTokenUsed: input.qrToken,
    status,
  });

  await logActivity({
    tenantId: new ObjectId(auth.tenantId),
    userId: new ObjectId(auth.userId),
    action: "attendance_marked",
    description: `Checked in (${status})`,
  });

  return { date, checkInTime: now, status };
}

// Self-service: an employee/student's own check-in history, most recent
// first. Powers both the mobile home screen's "already checked in today"
// state and a full history view.
export async function listMyAttendance(tenantId: ObjectId, userId: ObjectId) {
  const attendance = await attendanceCollection();
  return attendance
    .find({ tenantId, userId })
    .sort({ date: -1 })
    .project({ date: 1, checkInTime: 1, checkOutTime: 1, status: 1 })
    .toArray();
}

export async function listAttendance(tenantId: ObjectId, filters: ListAttendanceQuery = {}) {
  const attendance = await attendanceCollection();

  const match: Record<string, unknown> = { tenantId };
  if (filters.date) match.date = filters.date;
  if (filters.status) match.status = filters.status;

  const records = await attendance
    .aggregate([
      { $match: match },
      { $sort: { date: -1, checkInTime: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          date: 1,
          checkInTime: 1,
          checkOutTime: 1,
          status: 1,
          latitude: 1,
          longitude: 1,
          photoUrl: 1,
          "user.name": 1,
          "user.role": 1,
          "user.uniqueId": 1,
        },
      },
    ])
    .toArray();

  return records;
}
