import { getDb } from "@/lib/mongodb";
import type { ActivityLog, Attendance, Fee, Settings, SuperAdmin, Task, Tenant, User } from "@/types/models";

export async function tenantsCollection() {
  const db = await getDb();
  return db.collection<Tenant>("tenants");
}

export async function usersCollection() {
  const db = await getDb();
  return db.collection<User>("users");
}

export async function settingsCollection() {
  const db = await getDb();
  return db.collection<Settings>("settings");
}

export async function attendanceCollection() {
  const db = await getDb();
  return db.collection<Attendance>("attendance");
}

export async function feesCollection() {
  const db = await getDb();
  return db.collection<Fee>("fees");
}

export async function tasksCollection() {
  const db = await getDb();
  return db.collection<Task>("tasks");
}

export async function activityLogCollection() {
  const db = await getDb();
  return db.collection<ActivityLog>("activityLog");
}

export async function superAdminsCollection() {
  const db = await getDb();
  return db.collection<SuperAdmin>("superAdmins");
}

export interface Counter {
  _id: string;
  seq: number;
}

export async function countersCollection() {
  const db = await getDb();
  return db.collection<Counter>("counters");
}

let indexesEnsured = false;

// Idempotent — safe to call on every cold start. Mongo no-ops if the index already exists.
export async function ensureIndexes() {
  if (indexesEnsured) return;

  const [tenants, users, settings, attendance, fees, tasks, activityLog, superAdmins] = await Promise.all([
    tenantsCollection(),
    usersCollection(),
    settingsCollection(),
    attendanceCollection(),
    feesCollection(),
    tasksCollection(),
    activityLogCollection(),
    superAdminsCollection(),
  ]);

  await Promise.all([
    tenants.createIndex({ ownerEmail: 1 }, { unique: true }),
    tenants.createIndex({ code: 1 }, { unique: true }),
    users.createIndex({ email: 1 }, { unique: true, sparse: true }),
    users.createIndex({ cnic: 1 }, { unique: true, sparse: true }),
    users.createIndex({ tenantId: 1 }),
    settings.createIndex({ tenantId: 1 }, { unique: true }),
    attendance.createIndex({ tenantId: 1, userId: 1, date: 1 }, { unique: true }),
    fees.createIndex({ tenantId: 1, studentId: 1 }),
    tasks.createIndex({ tenantId: 1, assignedTo: 1 }),
    activityLog.createIndex({ tenantId: 1, timestamp: -1 }),
    superAdmins.createIndex({ email: 1 }, { unique: true }),
  ]);

  indexesEnsured = true;
}
