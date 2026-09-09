import type { ObjectId } from "mongodb";
import { countersCollection } from "@/lib/db/collections";

interface StudentIdInput {
  tenantId: ObjectId;
  tenantCode: string;
  department: string;
  course: string;
  batch: string;
  year?: number;
}

// Format: {TENANT}-{DEPT}-{COURSE}-{BATCH}-{YEAR}-{SEQ}, e.g. NVTTC-DM-NAV-A-2026-001.
// The sequence resets per tenant per year (not per department/course/batch) and is
// allocated atomically via a $inc on a counters document, so concurrent enrollments
// never collide even without a transaction.
export async function generateStudentId({
  tenantId,
  tenantCode,
  department,
  course,
  batch,
  year,
}: StudentIdInput) {
  const counters = await countersCollection();
  const y = year ?? new Date().getFullYear();
  const key = `student:${tenantId.toString()}:${y}`;

  const result = await counters.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  const seq = result!.seq;
  const seqStr = seq.toString().padStart(3, "0");

  const dept = department.trim().toUpperCase();
  const crs = course.trim().toUpperCase();
  const bat = batch.trim().toUpperCase();

  return `${tenantCode}-${dept}-${crs}-${bat}-${y}-${seqStr}`;
}
