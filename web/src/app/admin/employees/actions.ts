"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { createEmployee, updateEmployee } from "@/lib/services/employees";
import { createEmployeeSchema } from "@/lib/validation/employees";

export interface CreateEmployeeState {
  error?: string;
}

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.tenantId) {
    redirect("/login");
  }
  return session;
}

export async function createEmployeeAction(
  _prevState: CreateEmployeeState,
  formData: FormData
): Promise<CreateEmployeeState> {
  const session = await requireAdminSession();

  const parsed = createEmployeeSchema.safeParse({
    name: formData.get("name"),
    cnic: formData.get("cnic"),
    dob: formData.get("dob"),
    department: formData.get("department"),
    designation: formData.get("designation"),
    coursesTaught: formData.get("coursesTaught") || undefined,
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid input" };
  }

  try {
    await createEmployee(new ObjectId(session.tenantId!), parsed.data, new ObjectId(session.userId));
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/employees");
  redirect("/admin/employees");
}

export async function toggleEmployeeStatusAction(id: string, nextStatus: "active" | "inactive") {
  const session = await requireAdminSession();
  await updateEmployee(new ObjectId(session.tenantId!), id, { status: nextStatus }, new ObjectId(session.userId));
  revalidatePath("/admin/employees");
}
