import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { reviewSubmissionSchema } from "@/lib/validation/tasks";
import { reviewSubmission } from "@/lib/services/tasks";

// Employee (task owner) only: mark a student's submission reviewed with remarks/marks.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["employee"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = reviewSubmissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const submission = await reviewSubmission(
      { userId: auth.userId, tenantId: auth.tenantId!, role: auth.role },
      id,
      parsed.data
    );
    return NextResponse.json({ submission });
  } catch (error) {
    return toErrorResponse(error);
  }
}
