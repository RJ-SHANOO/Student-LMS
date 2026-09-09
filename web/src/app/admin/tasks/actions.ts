"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { createTask, updateTask } from "@/lib/services/tasks";
import { createTaskSchema } from "@/lib/validation/tasks";

export interface CreateTaskState {
  error?: string;
}

export interface UpdateTaskStatusState {
  error?: string;
}

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.tenantId) {
    redirect("/login");
  }
  return session;
}

export async function createTaskAction(
  _prevState: CreateTaskState,
  formData: FormData
): Promise<CreateTaskState> {
  const session = await requireAdminSession();

  const parsed = createTaskSchema.safeParse({
    assignedTo: formData.get("assignedTo"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid input" };
  }

  try {
    await createTask(new ObjectId(session.tenantId!), parsed.data, new ObjectId(session.userId));
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/tasks");
  redirect("/admin/tasks");
}

export async function updateTaskStatusAction(id: string, status: "pending" | "in-progress" | "completed") {
  const session = await requireAdminSession();
  await updateTask({ userId: session.userId, tenantId: session.tenantId!, role: "admin" }, id, { status });
  revalidatePath("/admin/tasks");
  revalidatePath(`/admin/tasks/${id}`);
}
