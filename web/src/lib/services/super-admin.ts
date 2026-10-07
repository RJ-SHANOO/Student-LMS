import { ObjectId } from "mongodb";
import {
  activityLogCollection,
  attendanceCollection,
  coursesCollection,
  feesCollection,
  settingsCollection,
  superAdminsCollection,
  taskSubmissionsCollection,
  tasksCollection,
  tenantsCollection,
  usersCollection,
} from "@/lib/db/collections";
import { AuthError, hashPassword, signJwt, verifyPassword } from "@/lib/auth";
import { logActivity } from "@/lib/services/activity-log";
import type { TenantStatus, ThemePreference } from "@/types/models";

export async function authenticateSuperAdmin(email: string, password: string) {
  const superAdmins = await superAdminsCollection();
  const account = await superAdmins.findOne({ email });

  if (!account || !(await verifyPassword(password, account.passwordHash))) {
    throw new AuthError("Invalid email or password", 401);
  }

  const token = signJwt({
    userId: account._id!.toString(),
    tenantId: null,
    role: "superadmin",
  });

  return { token, account };
}

export async function listTenantsWithStats() {
  const tenants = await tenantsCollection();

  return tenants
    .aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "tenantId",
          as: "users",
        },
      },
      {
        $project: {
          name: 1,
          code: 1,
          ownerName: 1,
          ownerEmail: 1,
          status: 1,
          createdAt: 1,
          userCount: { $size: "$users" },
        },
      },
    ])
    .toArray();
}

export async function getTenantById(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Tenant not found", 404);
  }
  const tenants = await tenantsCollection();
  const tenant = await tenants.findOne({ _id: new ObjectId(id) });
  if (!tenant) {
    throw new AuthError("Tenant not found", 404);
  }
  return tenant;
}

export async function setTenantStatus(id: string, status: TenantStatus) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Tenant not found", 404);
  }
  const tenants = await tenantsCollection();
  const updated = await tenants.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status } },
    { returnDocument: "after" }
  );
  if (!updated) {
    throw new AuthError("Tenant not found", 404);
  }
  return updated;
}

// Edits the institute's profile and keeps its login account (a Users record
// with role "admin") in sync, since that's what authenticateAdmin looks up by
// email — Tenant.ownerEmail is a display copy, not the login credential itself.
export async function updateTenant(
  id: string,
  input: { instituteName: string; ownerName: string; email: string; phone: string }
) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Tenant not found", 404);
  }
  const tenantId = new ObjectId(id);
  const tenants = await tenantsCollection();
  const users = await usersCollection();

  const adminUser = await users.findOne({ tenantId, role: "admin" });
  if (!adminUser) {
    throw new AuthError("This institute has no login account to update", 404);
  }

  if (input.email !== adminUser.email) {
    const emailTaken = await users.findOne({ email: input.email, role: "admin", _id: { $ne: adminUser._id } });
    if (emailTaken) {
      throw new AuthError("Another institute already uses this login email", 409);
    }
  }

  const updated = await tenants.findOneAndUpdate(
    { _id: tenantId },
    { $set: { name: input.instituteName, ownerName: input.ownerName, ownerEmail: input.email, ownerPhone: input.phone } },
    { returnDocument: "after" }
  );
  if (!updated) {
    throw new AuthError("Tenant not found", 404);
  }

  await users.updateOne(
    { _id: adminUser._id },
    { $set: { name: input.ownerName, email: input.email, phone: input.phone } }
  );

  await logActivity({
    tenantId,
    userId: adminUser._id!,
    action: "institute_updated",
    description: `Institute profile updated by Super Admin`,
  });

  return updated;
}

// Super Admin-issued password reset for an institute's login account.
export async function resetTenantPassword(id: string, newPassword: string) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Tenant not found", 404);
  }
  const tenantId = new ObjectId(id);
  const users = await usersCollection();

  const adminUser = await users.findOne({ tenantId, role: "admin" });
  if (!adminUser) {
    throw new AuthError("This institute has no login account to reset", 404);
  }

  const passwordHash = await hashPassword(newPassword);
  await users.updateOne({ _id: adminUser._id }, { $set: { passwordHash } });

  await logActivity({
    tenantId,
    userId: adminUser._id!,
    action: "institute_password_reset",
    description: `Login password reset by Super Admin`,
  });
}

// Permanently wipes the institute and every record scoped to it. There is no
// undo — the Super Admin UI gates this behind typing the institute's name.
export async function deleteTenant(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Tenant not found", 404);
  }
  const tenantId = new ObjectId(id);

  const [tenants, users, courses, settings, attendance, fees, tasks, taskSubmissions, activityLog] =
    await Promise.all([
      tenantsCollection(),
      usersCollection(),
      coursesCollection(),
      settingsCollection(),
      attendanceCollection(),
      feesCollection(),
      tasksCollection(),
      taskSubmissionsCollection(),
      activityLogCollection(),
    ]);

  const tenant = await tenants.findOne({ _id: tenantId });
  if (!tenant) {
    throw new AuthError("Tenant not found", 404);
  }

  await Promise.all([
    users.deleteMany({ tenantId }),
    courses.deleteMany({ tenantId }),
    settings.deleteMany({ tenantId }),
    attendance.deleteMany({ tenantId }),
    fees.deleteMany({ tenantId }),
    tasks.deleteMany({ tenantId }),
    taskSubmissions.deleteMany({ tenantId }),
    activityLog.deleteMany({ tenantId }),
  ]);

  await tenants.deleteOne({ _id: tenantId });
}

export async function getSuperAdminById(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AuthError("Not found", 404);
  }
  const superAdmins = await superAdminsCollection();
  const account = await superAdmins.findOne({ _id: new ObjectId(id) });
  if (!account) {
    throw new AuthError("Not found", 404);
  }
  return account;
}

export async function updateSuperAdminTheme(id: string, themePreference: ThemePreference) {
  const superAdmins = await superAdminsCollection();
  const updated = await superAdmins.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { themePreference } },
    { returnDocument: "after" }
  );
  if (!updated) {
    throw new AuthError("Not found", 404);
  }
  return updated;
}

export async function listSuperAdmins() {
  const superAdmins = await superAdminsCollection();
  return superAdmins.find({}, { projection: { passwordHash: 0 } }).sort({ createdAt: -1 }).toArray();
}

export async function createSuperAdmin(input: { name: string; email: string; password: string }) {
  const superAdmins = await superAdminsCollection();

  const existing = await superAdmins.findOne({ email: input.email });
  if (existing) {
    throw new AuthError("A super admin with this email already exists", 409);
  }

  const passwordHash = await hashPassword(input.password);
  const now = new Date();
  const result = await superAdmins.insertOne({
    name: input.name,
    email: input.email,
    passwordHash,
    createdAt: now,
  });

  return { _id: result.insertedId, name: input.name, email: input.email, createdAt: now };
}

export async function getPlatformStats() {
  const tenants = await tenantsCollection();
  const users = await usersCollection();

  const [tenantCount, activeTenantCount, totalUsers] = await Promise.all([
    tenants.countDocuments({}),
    tenants.countDocuments({ status: "active" }),
    users.countDocuments({}),
  ]);

  return { tenantCount, activeTenantCount, totalUsers };
}
