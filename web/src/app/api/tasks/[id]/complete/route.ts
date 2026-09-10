import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { updateTaskCompletionSchema } from "@/lib/validation/tasks";
import { upsertMyCompletion } from "@/lib/services/tasks";

// Self-service: a student/employee reports their own progress on a task
// they're the audience for. Distinct from PATCH /api/tasks/[id], which edits
// the task itself and is admin-only.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["employee", "student"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateTaskCompletionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const result = await upsertMyCompletion(
      { userId: auth.userId, tenantId: auth.tenantId!, role: auth.role },
      id,
      parsed.data
    );
    return NextResponse.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
