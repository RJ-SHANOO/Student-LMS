import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { getSettings } from "@/lib/services/settings";

// Members (employee/student) need the tenant's theme preference for the mobile
// app, but not the rest of Settings (office GPS, radius, late-time cutoff) —
// this is deliberately narrower than the admin-only GET /api/settings.
export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin", "employee", "student"]);
    const settings = await getSettings(new ObjectId(auth.tenantId!));
    return NextResponse.json({ themePreference: settings.themePreference ?? "system" });
  } catch (error) {
    return toErrorResponse(error);
  }
}
