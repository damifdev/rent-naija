"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { flattenErrors, loginSchema, signupSchema, type FormState } from "@/lib/validation";

const safeNext = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/dashboard";
};

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };
  const d = parsed.data;

  if (!rateLimit(`signup:${await clientIp()}`, 10, 60 * 60_000)) {
    return { error: "Too many sign-up attempts. Try again in an hour." };
  }

  const db = await getDb();
  if (await db.prepare("SELECT 1 FROM users WHERE email = ?").get(d.email)) {
    return { fieldErrors: { email: "An account with this email already exists. Log in instead." } };
  }
  const info = await db
    .prepare("INSERT INTO users (name, email, phone, password_hash, role) VALUES (?,?,?,?,?)")
    .run(d.name, d.email, d.phone, bcrypt.hashSync(d.password, 10), d.role);
  await createSession(Number(info.lastInsertRowid));
  redirect("/dashboard");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };
  const { email, password } = parsed.data;

  if (!rateLimit(`login:${await clientIp()}:${email}`, 8, 15 * 60_000)) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  const db = await getDb();
  const row = (await db
    .prepare("SELECT id, password_hash FROM users WHERE email = ?")
    .get(email)) as { id: number; password_hash: string } | undefined;
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return { error: "Email or password is incorrect." };
  }
  await createSession(row.id);
  redirect(safeNext(fd.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

/** A logged-in tenant clicking "Post a listing" needs to switch accounts: log them out
 *  and send them to login, with a notice explaining why, instead of silently bouncing
 *  them off the signup/login page (which redirect anyone already signed in to /dashboard). */
export async function logoutToPostListing() {
  await destroySession();
  redirect("/login?next=%2Fdashboard%2Flistings%2Fnew&switch=landlord");
}
