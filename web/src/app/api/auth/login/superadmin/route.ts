import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { toErrorResponse } from "@/lib/auth";
import { superAdminLoginSchema } from "@/lib/validation/super-admin";
import { authenticateSuperAdmin } from "@/lib/services/super-admin";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = superAdminLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  try {
    const { token, account } = await authenticateSuperAdmin(parsed.data.email, parsed.data.password);
    return NextResponse.json({
      token,
      user: { id: account._id!.toString(), name: account.name, email: account.email, role: "superadmin" },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
