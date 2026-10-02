"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function setListingStatus(id: number, status: "approved" | "rejected" | "pending") {
  await requireUser(["admin"]);
  if (!["approved", "rejected", "pending"].includes(status)) return;
  getDb().prepare("UPDATE properties SET status = ? WHERE id = ?").run(status, id);
  revalidatePath("/", "layout");
}

export async function toggleFeatured(id: number) {
  await requireUser(["admin"]);
  getDb().prepare("UPDATE properties SET featured = 1 - featured WHERE id = ?").run(id);
  revalidatePath("/", "layout");
}

export async function toggleVerified(userId: number) {
  await requireUser(["admin"]);
  getDb().prepare("UPDATE users SET verified = 1 - verified WHERE id = ? AND role != 'tenant'").run(userId);
  revalidatePath("/", "layout");
}

export async function deleteUser(userId: number) {
  const admin = await requireUser(["admin"]);
  if (userId === admin.id) return;
  getDb().prepare("DELETE FROM users WHERE id = ? AND role != 'admin'").run(userId);
  revalidatePath("/", "layout");
}
