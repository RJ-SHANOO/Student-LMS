"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { createFee, recordPayment } from "@/lib/services/fees";
import { createFeeSchema } from "@/lib/validation/fees";

export interface CreateFeeState {
  error?: string;
}

export interface RecordPaymentState {
  error?: string;
}

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.tenantId) {
    redirect("/login");
  }
  return session;
}

export async function createFeeAction(
  _prevState: CreateFeeState,
  formData: FormData
): Promise<CreateFeeState> {
  const session = await requireAdminSession();

  const parsed = createFeeSchema.safeParse({
    studentId: formData.get("studentId"),
    totalFee: Number(formData.get("totalFee")),
    dueDate: formData.get("dueDate"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid input" };
  }

  try {
    await createFee(new ObjectId(session.tenantId!), parsed.data, new ObjectId(session.userId));
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/fees");
  redirect("/admin/fees");
}

export async function recordPaymentAction(
  id: string,
  _prevState: RecordPaymentState,
  formData: FormData
): Promise<RecordPaymentState> {
  const session = await requireAdminSession();

  const amount = Number(formData.get("amount"));
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid payment amount" };
  }

  try {
    await recordPayment(new ObjectId(session.tenantId!), id, amount, new ObjectId(session.userId));
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message };
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath(`/admin/fees/${id}`);
  revalidatePath("/admin/fees");
  return {};
}
