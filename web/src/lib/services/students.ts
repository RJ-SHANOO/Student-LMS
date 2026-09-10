import { ObjectId, type Filter } from "mongodb";
import { usersCollection } from "@/lib/db/collections";
import { AuthError } from "@/lib/auth";
import { generateStudentId } from "@/lib/student-id";
import { logActivity } from "@/lib/services/activity-log";
import type { Tenant, User } from "@/types/models";
import type { createStudentSchema, updateStudentSchema } from "@/lib/validation/students";
import type { z } from "zod";

type CreateStudentInput = z.infer<typeof createStudentSchema>;
type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export async function createStudent(tenant: Tenant, input: CreateStudentInput, actorId: ObjectId) {
  const users = await usersCollection();

  const existingCnic = await users.findOne({ cnic: input.cnic });
  if (existingCnic) {
    throw new AuthError("A person with this CNIC is already registered", 409);
  }

  const uniqueId = await generateStudentId({
    tenantId: tenant._id!,
    tenantCode: tenant.code,
    department: input.department,
    course: input.course,
    batch: input.batch,
  });

  const now = new Date();
  const result = await users.insertOne({
    tenantId: tenant._id!,
    name: input.name,
    cnic: input.cnic,
    dob: input.dob,
    role: "student",
    department: input.department.toUpperCase(),
    course: input.course.toUpperCase(),
    batch: input.batch.toUpperCase(),
    status: "active",
    uniqueId,
    createdAt: now,
  });

  await logActivity({
    tenantId: tenant._id!,
    userId: actorId,
    action: "student_created",
    description: `Created student ${input.name} (${uniqueId})`,
  });

  return { id: result.insertedId, uniqueId };
}

export async function listStudents(
  tenantId: ObjectId,
  filters: { status?: "active" | "inactive"; search?: string } = {}
) {
  const users = await usersCollection();
  const query: Filter<User> = { tenantId, role: "student" };

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { uniqueId: { $regex: filters.search, $options: "i" } },
      { cnic: { $regex: filters.search } },
    ];
  }

  return users.find(query).sort({ createdAt: -1 }).toArray();
}

export async function listDistinctCourses(tenantId: ObjectId) {
  const users = await usersCollection();
  const courses = await users.distinct("course", { tenantId, role: "student" });
  return courses.filter((c): c is string => Boolean(c)).sort();
}

export async function getStudent(tenantId: ObjectId, id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Student not found", 404);
  }
  const users = await usersCollection();
  const student = await users.findOne({ _id: new ObjectId(id), tenantId, role: "student" });
  if (!student) {
    throw new AuthError("Student not found", 404);
  }
  return student;
}

export async function updateStudent(
  tenantId: ObjectId,
  id: string,
  input: UpdateStudentInput,
  actorId: ObjectId
) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Student not found", 404);
  }
  const users = await usersCollection();

  const update: Partial<User> = { ...input };
  if (update.department) update.department = update.department.toUpperCase();
  if (update.course) update.course = update.course.toUpperCase();
  if (update.batch) update.batch = update.batch.toUpperCase();

  const student = await users.findOneAndUpdate(
    { _id: new ObjectId(id), tenantId, role: "student" },
    { $set: update },
    { returnDocument: "after" }
  );

  if (!student) {
    throw new AuthError("Student not found", 404);
  }

  await logActivity({
    tenantId,
    userId: actorId,
    action: input.status ? "student_status_changed" : "student_updated",
    description: input.status
      ? `Set ${student.name} (${student.uniqueId}) to ${input.status}`
      : `Updated ${student.name} (${student.uniqueId})`,
  });

  return student;
}
