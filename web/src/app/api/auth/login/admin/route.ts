import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { toErrorResponse } from "@/lib/auth";
import { loginAdminSchema } from "@/lib/validation/auth";
import { authenticateAdmin } from "@/lib/services/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginAdminSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  try {
    const { token, user } = await authenticateAdmin(parsed.data.email, parsed.data.password);

    return NextResponse.json({
      token,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
