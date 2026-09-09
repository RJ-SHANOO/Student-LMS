import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import type { JwtPayload } from "@/types/models";

const COOKIE_NAME = "soil_token";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // mirrors the default JWT_EXPIRES_IN of 7d

export async function createSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return verifyJwt(token);
  } catch {
    return null;
  }
}
