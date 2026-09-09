import { ObjectId } from "mongodb";
import { superAdminsCollection, tenantsCollection, usersCollection } from "@/lib/db/collections";
import { AuthError, signJwt, verifyPassword } from "@/lib/auth";
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
