import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { updateTaskSchema } from "@/lib/validation/tasks";
import { getTaskForEmployee, getTaskForInstitute, getTaskForStudent, updateTask } from "@/lib/services/tasks";

// Role-scoped detail: employees see the full roster + download links for tasks
// they created, Institute sees status/marks only, students see their own submission.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["admin", "employee", "student"]);
    const { id } = await params;
    const actor = { userId: auth.userId, tenantId: auth.tenantId!, role: auth.role };

    if (auth.role === "admin") {
      const task = await getTaskForInstitute(new ObjectId(auth.tenantId!), id);
      return NextResponse.json({ task });
    }
    if (auth.role === "employee") {
      const task = await getTaskForEmployee(actor, id);
      return NextResponse.json({ task });
    }
    const task = await getTaskForStudent(actor, id);
    return NextResponse.json({ task });
  } catch (error) {
    return toErrorResponse(error);
  }
}

// Employee-only: edit a task they created.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = requireRole(request, ["employee"]);
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const task = await updateTask({ userId: auth.userId, tenantId: auth.tenantId!, role: auth.role }, id, parsed.data);
    return NextResponse.json({ task });
  } catch (error) {
    return toErrorResponse(error);
  }
}
