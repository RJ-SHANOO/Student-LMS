import { ensureIndexes, tenantsCollection, usersCollection } from "@/lib/db/collections";
import { AuthError, hashPassword, signJwt, verifyPassword } from "@/lib/auth";
import { generateTenantCode } from "@/lib/tenant-code";
import { createDefaultSettings } from "@/lib/services/settings";
import { logActivity } from "@/lib/services/activity-log";

export interface RegisterInput {
  instituteName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
}

export async function registerTenant(input: RegisterInput) {
  await ensureIndexes();
  const tenants = await tenantsCollection();
  const users = await usersCollection();

  const existing = await tenants.findOne({ ownerEmail: input.email });
  if (existing) {
    throw new AuthError("An account with this email already exists", 409);
  }

  const code = await generateTenantCode(tenants, input.instituteName);
  const now = new Date();

  const tenantResult = await tenants.insertOne({
    name: input.instituteName,
    code,
    ownerName: input.ownerName,
    ownerEmail: input.email,
    ownerPhone: input.phone,
    createdAt: now,
    status: "active",
  });

  const passwordHash = await hashPassword(input.password);
  const userResult = await users.insertOne({
    tenantId: tenantResult.insertedId,
    name: input.ownerName,
    role: "admin",
    email: input.email,
    phone: input.phone,
    passwordHash,
    status: "active",
    createdAt: now,
  });

  await createDefaultSettings(tenantResult.insertedId, input.instituteName);

  await logActivity({
    tenantId: tenantResult.insertedId,
    userId: userResult.insertedId,
    action: "tenant_registered",
    description: `${input.instituteName} registered by ${input.ownerName}`,
  });

  const token = signJwt({
    userId: userResult.insertedId.toString(),
    tenantId: tenantResult.insertedId.toString(),
    role: "admin",
  });

  return {
    token,
    user: {
      id: userResult.insertedId.toString(),
      name: input.ownerName,
      email: input.email,
      role: "admin" as const,
    },
    tenant: {
      id: tenantResult.insertedId.toString(),
      name: input.instituteName,
      code,
      status: "active" as const,
    },
  };
}

export async function authenticateAdmin(email: string, password: string) {
  const users = await usersCollection();
  const user = await users.findOne({ email, role: "admin" });

  if (!user || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    throw new AuthError("Invalid email or password", 401);
  }
  if (user.status !== "active") {
    throw new AuthError("This account has been deactivated", 403);
  }

  const tenants = await tenantsCollection();
  const tenant = await tenants.findOne({ _id: user.tenantId });
  if (!tenant || tenant.status !== "active") {
    throw new AuthError("This institute has been deactivated", 403);
  }

  const token = signJwt({
    userId: user._id!.toString(),
    tenantId: user.tenantId.toString(),
    role: user.role,
  });

  await logActivity({ tenantId: user.tenantId, userId: user._id!, action: "admin_login" });

  return { token, user, tenant };
}

export async function authenticateMember(cnic: string, dob: string) {
  const users = await usersCollection();
  const user = await users.findOne({ cnic, dob, role: { $in: ["employee", "student"] } });

  if (!user) {
    throw new AuthError("Invalid CNIC or date of birth", 401);
  }
  if (user.status !== "active") {
    throw new AuthError("This account has been deactivated", 403);
  }

  const tenants = await tenantsCollection();
  const tenant = await tenants.findOne({ _id: user.tenantId });
  if (!tenant || tenant.status !== "active") {
    throw new AuthError("This institute has been deactivated", 403);
  }

  const token = signJwt({
    userId: user._id!.toString(),
    tenantId: user.tenantId.toString(),
    role: user.role,
  });

  await logActivity({ tenantId: user.tenantId, userId: user._id!, action: "member_login" });

  return { token, user, tenant };
}
