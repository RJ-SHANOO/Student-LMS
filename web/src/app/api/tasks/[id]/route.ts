import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { updateTaskSchema } from "@/lib/validation/tasks";
import { getTask, updateTask } from "@/lib/services/tasks";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin", "employee", "student"]);
    const { id } = await params;
    const task = await getTask(new ObjectId(auth.tenantId!), id);

    if (auth.role !== "admin" && task.assignedTo.toString() !== auth.userId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin", "employee", "student"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const task = await updateTask(
      { userId: auth.userId, tenantId: auth.tenantId!, role: auth.role },
      id,
      parsed.data
    );
    return NextResponse.json({ task });
  } catch (error) {
    return toErrorResponse(error);
  }
}
