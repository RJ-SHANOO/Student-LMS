import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireRole, toErrorResponse } from "@/lib/auth";
import { createTaskSchema, listTasksQuerySchema } from "@/lib/validation/tasks";
import { createTask, listTasksForEmployee, listTasksForInstitute } from "@/lib/services/tasks";

// Employee-only: create a task for one of their own courses. multipart/form-data
// so an optional reference attachment can ride along with the fields.
export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ["employee"]);
    const formData = await request.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }
    const parsed = createTaskSchema.safeParse({
      courseId: formData.get("courseId"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      dueDate: formData.get("dueDate") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const attachment = formData.get("attachment");
    const { id } = await createTask(
      { userId: auth.userId, tenantId: auth.tenantId!, role: auth.role },
      parsed.data,
      attachment instanceof File ? attachment : undefined
    );
    return NextResponse.json({ id: id.toString() }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

// Institute sees every task (read-only); an employee sees only tasks they created.
export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ["admin", "employee"]);
    const tenantId = new ObjectId(auth.tenantId!);

    if (auth.role === "employee") {
      const tasks = await listTasksForEmployee(tenantId, new ObjectId(auth.userId));
      return NextResponse.json({ tasks });
    }

    const parsed = listTasksQuerySchema.safeParse({
      courseId: request.nextUrl.searchParams.get("courseId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
    }

    const tasks = await listTasksForInstitute(tenantId, parsed.data);
    return NextResponse.json({ tasks });
  } catch (error) {
    return toErrorResponse(error);
  }
}
