"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { tenantsCollection } from "@/lib/db/collections";
import { createStudent, updateStudent } from "@/lib/services/students";
import { createStudentSchema } from "@/lib/validation/students";

export interface CreateStudentState {
  error?: string;
}

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.tenantId) {
    redirect("/login");
  }
  return session;
}

export async function createStudentAction(
  _prevState: CreateStudentState,
  formData: FormData
): Promise<CreateStudentState> {
  const session = await requireAdminSession();

  const parsed = createStudentSchema.safeParse({
    name: formData.get("name"),
    cnic: formData.get("cnic"),
    dob: formData.get("dob"),
    department: formData.get("department"),
    course: formData.get("course"),
    batch: formData.get("batch"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid input" };
  }

  try {
    const tenants = await tenantsCollection();
    const tenant = await tenants.findOne({ _id: new ObjectId(session.tenantId!) });
    if (!tenant) throw new AuthError("Tenant not found", 404);

    await createStudent(tenant, parsed.data, new ObjectId(session.userId));
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/students");
  redirect("/admin/students");
}

export async function toggleStudentStatusAction(id: string, nextStatus: "active" | "inactive") {
  const session = await requireAdminSession();
  await updateStudent(new ObjectId(session.tenantId!), id, { status: nextStatus }, new ObjectId(session.userId));
  revalidatePath("/admin/students");
}
