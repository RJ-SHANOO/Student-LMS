import { ObjectId, type Filter } from "mongodb";
import { usersCollection } from "@/lib/db/collections";
import { AuthError } from "@/lib/auth";
import { logActivity } from "@/lib/services/activity-log";
import type { User } from "@/types/models";
import type { createEmployeeSchema, updateEmployeeSchema } from "@/lib/validation/employees";
import type { z } from "zod";

type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export async function createEmployee(tenantId: ObjectId, input: CreateEmployeeInput, actorId: ObjectId) {
  const users = await usersCollection();

  const existingCnic = await users.findOne({ cnic: input.cnic });
  if (existingCnic) {
    throw new AuthError("A person with this CNIC is already registered", 409);
  }

  const result = await users.insertOne({
    tenantId,
    name: input.name,
    cnic: input.cnic,
    dob: input.dob,
    role: "employee",
    department: input.department,
    designation: input.designation,
    coursesTaught: input.coursesTaught,
    status: "active",
    createdAt: new Date(),
  });

  await logActivity({
    tenantId,
    userId: actorId,
    action: "employee_created",
    description: `Created employee ${input.name}`,
  });

  return { id: result.insertedId };
}

export async function listEmployees(
  tenantId: ObjectId,
  filters: { status?: "active" | "inactive"; search?: string } = {}
) {
  const users = await usersCollection();
  const query: Filter<User> = { tenantId, role: "employee" };

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { cnic: { $regex: filters.search } },
      { designation: { $regex: filters.search, $options: "i" } },
    ];
  }

  return users.find(query).sort({ createdAt: -1 }).toArray();
}

export async function listDistinctDepartments(tenantId: ObjectId) {
  const users = await usersCollection();
  const departments = await users.distinct("department", { tenantId, role: "employee" });
  return departments.filter((d): d is string => Boolean(d)).sort();
}

export async function getEmployee(tenantId: ObjectId, id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Employee not found", 404);
  }
  const users = await usersCollection();
  const employee = await users.findOne({ _id: new ObjectId(id), tenantId, role: "employee" });
  if (!employee) {
    throw new AuthError("Employee not found", 404);
  }
  return employee;
}

export async function updateEmployee(
  tenantId: ObjectId,
  id: string,
  input: UpdateEmployeeInput,
  actorId: ObjectId
) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Employee not found", 404);
  }
  const users = await usersCollection();

  const employee = await users.findOneAndUpdate(
    { _id: new ObjectId(id), tenantId, role: "employee" },
    { $set: input },
    { returnDocument: "after" }
  );

  if (!employee) {
    throw new AuthError("Employee not found", 404);
  }

  await logActivity({
    tenantId,
    userId: actorId,
    action: input.status ? "employee_status_changed" : "employee_updated",
    description: input.status
      ? `Set ${employee.name} to ${input.status}`
      : `Updated ${employee.name}`,
  });

  return employee;
}
