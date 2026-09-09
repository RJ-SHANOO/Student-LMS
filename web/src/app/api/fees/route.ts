import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { createFeeSchema, listFeesQuerySchema } from "@/lib/validation/fees";
import { createFee, listFees } from "@/lib/services/fees";

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const body = await request.json().catch(() => null);
    const parsed = createFeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const { id } = await createFee(new ObjectId(auth.tenantId!), parsed.data, new ObjectId(auth.userId));
    return NextResponse.json({ id: id.toString() }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const parsed = listFeesQuerySchema.safeParse({
      studentId: request.nextUrl.searchParams.get("studentId") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const fees = await listFees(new ObjectId(auth.tenantId!), parsed.data);
    return NextResponse.json({ fees });
  } catch (error) {
    return toErrorResponse(error);
  }
}
