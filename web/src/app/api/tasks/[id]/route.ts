import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { updateTaskSchema } from "@/lib/validation/tasks";
import { getTaskForActor, updateTask } from "@/lib/services/tasks";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin", "employee"]);
    const { id } = await params;
    const task = await getTaskForActor({ userId: auth.userId, tenantId: auth.tenantId!, role: auth.role }, id);
    return NextResponse.json({ task });
  } catch (error) {
    return toErrorResponse(error);
  }
}

// Admin-only: edit a task's title/description/due date. Its audience (course
// or department) is fixed at creation — see /api/tasks/[id]/complete for how
// individual students/employees report their own progress.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const task = await updateTask(new ObjectId(auth.tenantId!), id, parsed.data);
    return NextResponse.json({ task });
  } catch (error) {
    return toErrorResponse(error);
  }
}
