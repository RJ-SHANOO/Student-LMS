import { NextRequest, NextResponse } from "next/server";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { listTenantsWithStats } from "@/lib/services/super-admin";

export async function GET(request: NextRequest) {
  try {
    requireRole(request, ["superadmin"]);
    const tenants = await listTenantsWithStats();
    return NextResponse.json({ tenants });
  } catch (error) {
    return toErrorResponse(error);
  }
}
