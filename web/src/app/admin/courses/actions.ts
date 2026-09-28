"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { createCourse, updateCourse } from "@/lib/services/courses";
import { createCourseSchema } from "@/lib/validation/courses";

export interface CreateCourseState {
  error?: string;
}

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.tenantId) {
    redirect("/login?role=institute");
  }
  return session;
}

export async function createCourseAction(
  _prevState: CreateCourseState,
  formData: FormData
): Promise<CreateCourseState> {
  const session = await requireAdminSession();

  const parsed = createCourseSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    duration: formData.get("duration") || undefined,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid input" };
  }

  try {
    await createCourse(new ObjectId(session.tenantId!), parsed.data, new ObjectId(session.userId));
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function toggleCourseStatusAction(id: string, nextStatus: "active" | "inactive") {
  const session = await requireAdminSession();
  await updateCourse(new ObjectId(session.tenantId!), id, { status: nextStatus }, new ObjectId(session.userId));
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
}

export interface EditCourseState {
  error?: string;
  success?: boolean;
}

export async function editCourseAction(
  id: string,
  _prevState: EditCourseState,
  formData: FormData
): Promise<EditCourseState> {
  const session = await requireAdminSession();

  const name = formData.get("name");
  const duration = formData.get("duration");
  if (typeof name !== "string" || name.trim().length < 2) {
    return { error: "Course name is too short" };
  }

  try {
    await updateCourse(
      new ObjectId(session.tenantId!),
      id,
      { name, duration: typeof duration === "string" && duration ? duration : undefined },
      new ObjectId(session.userId)
    );
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/admin/courses/${id}`);
  revalidatePath("/admin/courses");
  return { success: true };
}
