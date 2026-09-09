import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { createTaskSchema, listTasksQuerySchema } from "@/lib/validation/tasks";
import { createTask, listTasks } from "@/lib/services/tasks";

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const body = await request.json().catch(() => null);
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const { id } = await createTask(new ObjectId(auth.tenantId!), parsed.data, new ObjectId(auth.userId));
    return NextResponse.json({ id: id.toString() }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin"]);
    const parsed = listTasksQuerySchema.safeParse({
      assignedTo: request.nextUrl.searchParams.get("assignedTo") ?? undefined,
      status: request.nextUrl.searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const tasks = await listTasks(new ObjectId(auth.tenantId!), parsed.data);
    return NextResponse.json({ tasks });
  } catch (error) {
    return toErrorResponse(error);
  }
}
