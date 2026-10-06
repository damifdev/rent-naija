"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { getUser, requireUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { flattenErrors, inquirySchema, type FormState } from "@/lib/validation";

export async function sendInquiry(propertyId: number, _: FormState, fd: FormData): Promise<FormState> {
  // Honeypot: real people never see or fill this field. Pretend it worked.
  if (String(fd.get("website") ?? "").trim() !== "") {
    return { ok: true, message: "Inquiry sent. The agent will contact you shortly." };
  }

  const parsed = inquirySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { fieldErrors: flattenErrors(parsed.error) };

  if (!rateLimit(`inquiry:${await clientIp()}:${propertyId}`, 3, 60 * 60_000) ||
      !rateLimit(`inquiry-ip:${await clientIp()}`, 12, 60 * 60_000)) {
    return { error: "You have sent several inquiries already. Please wait a while before sending more." };
  }

  const db = await getDb();
  const prop = await db.prepare("SELECT id FROM properties WHERE id = ? AND status = 'approved'").get(propertyId);
  if (!prop) return { error: "This listing is no longer available." };

  const user = await getUser();
  const d = parsed.data;
  await db.prepare("INSERT INTO inquiries (property_id, sender_id, name, phone, message) VALUES (?,?,?,?,?)").run(
    propertyId, user?.id ?? null, d.name, d.phone, d.message
  );
  revalidatePath("/dashboard");
  return { ok: true, message: "Inquiry sent. The agent will contact you on the number you gave." };
}

export async function markInquiryRead(id: number) {
  const user = await requireUser(["landlord", "admin"]);
  const db = await getDb();
  await db
    .prepare(
      `UPDATE inquiries SET read_at = CASE WHEN read_at IS NULL THEN datetime('now') ELSE NULL END
       WHERE id = ? AND property_id IN (SELECT id FROM properties WHERE owner_id = ? OR ? = 'admin')`
    )
    .run(id, user.id, user.role);
  revalidatePath("/dashboard");
}

export async function toggleFavorite(propertyId: number, returnTo: string) {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  const db = await getDb();
  const del = await db.prepare("DELETE FROM favorites WHERE user_id = ? AND property_id = ?").run(user.id, propertyId);
  if (del.changes === 0) {
    await db.prepare("INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)").run(user.id, propertyId);
  }
  revalidatePath("/", "layout");
}
