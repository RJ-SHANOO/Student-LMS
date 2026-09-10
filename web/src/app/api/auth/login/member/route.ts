import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { toErrorResponse } from "@/lib/auth";
import { loginMemberSchema } from "@/lib/validation/auth";
import { authenticateMember } from "@/lib/services/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginMemberSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  try {
    const { token, user } = await authenticateMember(parsed.data.cnic, parsed.data.dob);

    return NextResponse.json({
      token,
      user: {
        id: user._id!.toString(),
        name: user.name,
        role: user.role,
        uniqueId: user.uniqueId,
        coursesTaught: user.coursesTaught,
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
