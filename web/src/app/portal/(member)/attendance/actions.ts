"use server";

import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { markAttendanceSchema } from "@/lib/validation/attendance";
import { markAttendance } from "@/lib/services/attendance";

export interface MarkAttendanceResult {
  ok: boolean;
  status?: "present" | "late";
  error?: string;
}

export async function markAttendanceAction(input: {
  qrToken: string;
  latitude: number;
  longitude: number;
  photo: string;
}): Promise<MarkAttendanceResult> {
  const session = await getSession();
  if (!session || !["employee", "student"].includes(session.role) || !session.tenantId) {
    redirect("/portal/login");
  }

  const parsed = markAttendanceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Could not read the QR code, location, or photo. Please try again." };
  }

  try {
    const result = await markAttendance({ userId: session.userId, tenantId: session.tenantId }, parsed.data);
    return { ok: true, status: result.status };
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: error.message };
    }
    console.error(error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
