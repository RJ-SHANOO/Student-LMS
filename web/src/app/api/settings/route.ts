import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { updateSettingsSchema } from "@/lib/validation/settings";
import { getSettings, updateSettings } from "@/lib/services/settings";

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const settings = await getSettings(new ObjectId(auth.tenantId!));
    return NextResponse.json({ settings });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const body = await request.json().catch(() => null);
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const settings = await updateSettings(new ObjectId(auth.tenantId!), parsed.data, new ObjectId(auth.userId));
    return NextResponse.json({ settings });
  } catch (error) {
    return toErrorResponse(error);
  }
}
