import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAuthUser } from "@/lib/auth";
import { tenantsCollection, usersCollection } from "@/lib/db/collections";

export async function GET(request: NextRequest) {
  const auth = getAuthUser(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await usersCollection();
  const user = await users.findOne({ _id: new ObjectId(auth.userId) });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tenants = await tenantsCollection();
  const tenant = await tenants.findOne({ _id: user.tenantId });

  return NextResponse.json({
    user: {
      id: user._id!.toString(),
      name: user.name,
      role: user.role,
      email: user.email,
      uniqueId: user.uniqueId,
    },
    tenant: tenant
      ? { id: tenant._id!.toString(), name: tenant.name, status: tenant.status }
      : null,
  });
}
