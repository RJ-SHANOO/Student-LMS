import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse, type NextRequest } from "next/server";
import type { JwtPayload } from "@/types/models";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

const SALT_ROUNDS = 10;

export function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
}

export function getAuthUser(request: NextRequest): JwtPayload | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  try {
    return verifyJwt(header.slice("Bearer ".length));
  } catch {
    return null;
  }
}

// Every tenant-scoped route handler should start with this: reject unauthenticated
// requests and requests from a role not permitted to hit the route, in one call.
export function requireRole(request: NextRequest, allowedRoles: JwtPayload["role"][]): JwtPayload {
  const auth = getAuthUser(request);
  if (!auth) throw new AuthError("Unauthorized", 401);
  if (!allowedRoles.includes(auth.role)) throw new AuthError("Forbidden", 403);
  return auth;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

// Every route handler's catch block should funnel errors through this so
// AuthError's intended status code reaches the client instead of a blanket 500.
export function toErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
