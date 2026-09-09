import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { recordPaymentSchema } from "@/lib/validation/fees";
import { getFee, recordPayment } from "@/lib/services/fees";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin"]);
    const { id } = await params;
    const fee = await getFee(new ObjectId(auth.tenantId!), id);
    return NextResponse.json({ fee });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = recordPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const fee = await recordPayment(new ObjectId(auth.tenantId!), id, parsed.data.amount, new ObjectId(auth.userId));
    return NextResponse.json({ fee });
  } catch (error) {
    return toErrorResponse(error);
  }
}
