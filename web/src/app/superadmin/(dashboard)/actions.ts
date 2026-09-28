"use server";

import { redirect } from "next/navigation";
import { destroySession } from "@/lib/session";

export async function logoutSuperAdminAction() {
  await destroySession();
  redirect("/login?role=superadmin");
}
