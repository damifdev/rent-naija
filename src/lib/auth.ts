import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { getDb } from "./db";

const COOKIE = "rn_session";
const MAX_AGE = 60 * 60 * 24 * 7;

const secret = () =>
  new TextEncoder().encode(
    process.env.SESSION_SECRET || "dev-only-secret-change-me-before-deploying"
  );

export type Role = "tenant" | "landlord" | "admin";
export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  agency: string | null;
  avatar_url: string | null;
  verified: number;
};

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Current user (fresh from the database), or null. Cached per request. */
export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const db = await getDb();
    const row = (await db
      .prepare(
        "SELECT id, name, email, phone, role, agency, avatar_url, verified FROM users WHERE id = ?"
      )
      .get(payload.uid as number)) as User | undefined;
    return row ?? null;
  } catch {
    return null;
  }
});

export async function requireUser(roles?: Role[]): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  if (roles && !roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
