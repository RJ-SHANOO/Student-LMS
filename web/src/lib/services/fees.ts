import { ObjectId, type Filter } from "mongodb";
import { feesCollection, usersCollection } from "@/lib/db/collections";
import { AuthError } from "@/lib/auth";
import { logActivity } from "@/lib/services/activity-log";
import type { Fee, FeeStatus } from "@/types/models";
import type { createFeeSchema, listFeesQuerySchema } from "@/lib/validation/fees";
import type { z } from "zod";

type CreateFeeInput = z.infer<typeof createFeeSchema>;
type ListFeesQuery = z.infer<typeof listFeesQuerySchema>;

function computeStatus(totalFee: number, paidAmount: number): FeeStatus {
  if (paidAmount <= 0) return "unpaid";
  if (paidAmount >= totalFee) return "paid";
  return "partial";
}

export async function createFee(tenantId: ObjectId, input: CreateFeeInput, actorId: ObjectId) {
  if (!ObjectId.isValid(input.studentId)) {
    throw new AuthError("Student not found", 404);
  }

  const users = await usersCollection();
  const student = await users.findOne({ _id: new ObjectId(input.studentId), tenantId, role: "student" });
  if (!student) {
    throw new AuthError("Student not found", 404);
  }

  const fees = await feesCollection();
  const result = await fees.insertOne({
    tenantId,
    studentId: student._id!,
    totalFee: input.totalFee,
    paidAmount: 0,
    remainingAmount: input.totalFee,
    status: "unpaid",
    dueDate: new Date(input.dueDate),
  });

  await logActivity({
    tenantId,
    userId: actorId,
    action: "fee_generated",
    description: `Generated a ${input.totalFee} fee for ${student.name}`,
  });

  return { id: result.insertedId };
}

export async function listFees(tenantId: ObjectId, filters: ListFeesQuery = {}) {
  const fees = await feesCollection();

  const match: Filter<Fee> = { tenantId };
  if (filters.studentId && ObjectId.isValid(filters.studentId)) {
    match.studentId = new ObjectId(filters.studentId);
  }
  if (filters.status) match.status = filters.status;

  const records = await fees
    .aggregate([
      { $match: match },
      { $sort: { dueDate: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $project: {
          totalFee: 1,
          paidAmount: 1,
          remainingAmount: 1,
          status: 1,
          dueDate: 1,
          "student.name": 1,
          "student.uniqueId": 1,
        },
      },
    ])
    .toArray();

  return records;
}

export async function getFee(tenantId: ObjectId, id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Fee record not found", 404);
  }
  const fees = await feesCollection();
  const fee = await fees.findOne({ _id: new ObjectId(id), tenantId });
  if (!fee) {
    throw new AuthError("Fee record not found", 404);
  }

  const users = await usersCollection();
  const student = await users.findOne({ _id: fee.studentId });

  return { ...fee, student };
}

export async function recordPayment(tenantId: ObjectId, id: string, amount: number, actorId: ObjectId) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Fee record not found", 404);
  }
  const fees = await feesCollection();
  const fee = await fees.findOne({ _id: new ObjectId(id), tenantId });
  if (!fee) {
    throw new AuthError("Fee record not found", 404);
  }

  const remaining = fee.totalFee - fee.paidAmount;
  if (amount > remaining) {
    throw new AuthError(
      `Payment of ${amount} exceeds the remaining balance of ${remaining}`,
      400
    );
  }

  const paidAmount = fee.paidAmount + amount;
  const remainingAmount = fee.totalFee - paidAmount;
  const status = computeStatus(fee.totalFee, paidAmount);

  const updated = await fees.findOneAndUpdate(
    { _id: fee._id, tenantId },
    { $set: { paidAmount, remainingAmount, status } },
    { returnDocument: "after" }
  );

  const users = await usersCollection();
  const student = await users.findOne({ _id: fee.studentId });

  await logActivity({
    tenantId,
    userId: actorId,
    action: "fee_payment_recorded",
    description: `Recorded a ${amount} payment for ${student?.name ?? "a student"}`,
  });

  return updated!;
}
