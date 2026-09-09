import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { setTenantStatusSchema } from "@/lib/validation/super-admin";
import { setTenantStatus } from "@/lib/services/super-admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireRole(request, ["superadmin"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = setTenantStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const tenant = await setTenantStatus(id, parsed.data.status);
    return NextResponse.json({ tenant });
  } catch (error) {
    return toErrorResponse(error);
  }
}
