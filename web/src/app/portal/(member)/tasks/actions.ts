"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { createTask, reviewSubmission, submitTask } from "@/lib/services/tasks";
import { createTaskSchema, reviewSubmissionSchema } from "@/lib/validation/tasks";

async function requireMemberSession(role: "employee" | "student") {
  const session = await getSession();
  if (!session || session.role !== role || !session.tenantId) {
    redirect("/login");
  }
  return session;
}

export interface CreateTaskState {
  error?: string;
}

export async function createTaskAction(_prevState: CreateTaskState, formData: FormData): Promise<CreateTaskState> {
  const session = await requireMemberSession("employee");

  const parsed = createTaskSchema.safeParse({
    courseId: formData.get("courseId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const attachment = formData.get("attachment");

  try {
    await createTask(
      { userId: session.userId, tenantId: session.tenantId!, role: "employee" },
      parsed.data,
      attachment instanceof File && attachment.size > 0 ? attachment : undefined
    );
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/portal/tasks");
  redirect("/portal/tasks");
}

export interface SubmitTaskState {
  error?: string;
}

export async function submitTaskAction(
  taskId: string,
  _prevState: SubmitTaskState,
  formData: FormData
): Promise<SubmitTaskState> {
  const session = await requireMemberSession("student");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please choose a file to submit." };
  }

  try {
    await submitTask({ userId: session.userId, tenantId: session.tenantId!, role: "student" }, taskId, file);
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/portal/tasks/${taskId}`);
  return {};
}

export interface ReviewSubmissionState {
  error?: string;
}

export async function reviewSubmissionAction(
  taskId: string,
  _prevState: ReviewSubmissionState,
  formData: FormData
): Promise<ReviewSubmissionState> {
  const session = await requireMemberSession("employee");

  const parsed = reviewSubmissionSchema.safeParse({
    studentId: formData.get("studentId"),
    remarks: formData.get("remarks") || undefined,
    marks: formData.get("marks") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await reviewSubmission(
      { userId: session.userId, tenantId: session.tenantId!, role: "employee" },
      taskId,
      parsed.data
    );
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/portal/tasks/${taskId}`);
  return {};
}
