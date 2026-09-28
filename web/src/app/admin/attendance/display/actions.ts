"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { generateQrToken } from "@/lib/qr-token";

export async function getQrTokenAction() {
  const session = await getSession();
  if (!session || session.role !== "admin" || !session.tenantId) {
    redirect("/login?role=institute");
  }
  return generateQrToken(session.tenantId);
}
