"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { saveUpload, deleteUpload } from "@/lib/storage";
import { requireUser } from "@/lib/auth";
import { AMENITIES } from "@/lib/constants";
import { flattenErrors, listingSchema, type FormState } from "@/lib/validation";

const MAX_PHOTOS = 8;

async function savePhotos(files: File[]): Promise<{ urls: string[]; error?: string }> {
  const urls: string[] = [];
  for (const f of files) {
    const result = await saveUpload(f);
    if ("error" in result) return { urls, error: result.error };
    urls.push(result.url);
  }
  return { urls };
}

function readForm(fd: FormData) {
  const raw = Object.fromEntries(
    ["title", "type", "state", "area", "price", "bedrooms", "bathrooms", "area_sqm", "tag", "description"].map(
      (k) => [k, String(fd.get(k) ?? "")]
    )
  );
  const amenities = fd
    .getAll("amenities")
    .map(String)
    .filter((a) => (AMENITIES as readonly string[]).includes(a));
  const photos = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  return { raw, amenities, photos };
}

const autoApprove = () => process.env.AUTO_APPROVE_LISTINGS === "true";

export async function createListing(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["landlord", "admin"]);
  const { raw, amenities, photos } = readForm(fd);

  const parsed = listingSchema.safeParse(raw);
  const fieldErrors = parsed.success ? {} : flattenErrors(parsed.error);
  if (photos.length === 0) fieldErrors.photos = "Add at least one photo of the property.";
  if (photos.length > MAX_PHOTOS) fieldErrors.photos = `You can add up to ${MAX_PHOTOS} photos.`;
  if (!parsed.success || Object.keys(fieldErrors).length) return { fieldErrors };

  const saved = await savePhotos(photos);
  if (saved.error) return { fieldErrors: { photos: saved.error } };

  const d = parsed.data;
  const db = await getDb();
  const status = user.role === "admin" || autoApprove() ? "approved" : "pending";

  const info = await db
    .prepare(
      `INSERT INTO properties (owner_id, title, description, type, state, area, price_yearly, bedrooms, bathrooms,
         area_sqm, tag, amenities, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    )
    .run(user.id, d.title, d.description, d.type, d.state, d.area, d.price, d.bedrooms, d.bathrooms, d.area_sqm, d.tag, JSON.stringify(amenities), status);
  const id = Number(info.lastInsertRowid);
  const ins = db.prepare("INSERT INTO property_images (property_id, url, position) VALUES (?,?,?)");
  for (const [i, u] of saved.urls.entries()) await ins.run(id, u, i);

  revalidatePath("/", "layout");
  redirect(`/dashboard?tab=listings&posted=${status}&id=${id}`);
}

export async function updateListing(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["landlord", "admin"]);
  const db = await getDb();
  const existing = (await db.prepare("SELECT owner_id, status FROM properties WHERE id = ?").get(id)) as
    | { owner_id: number; status: string }
    | undefined;
  if (!existing || (existing.owner_id !== user.id && user.role !== "admin")) redirect("/dashboard");

  const { raw, amenities, photos } = readForm(fd);
  const removeIds = fd.getAll("remove_images").map(Number).filter(Number.isInteger);
  const current = (await db.prepare("SELECT id, url FROM property_images WHERE property_id = ?").all(id)) as { id: number; url: string }[];
  const remaining = current.filter((i) => !removeIds.includes(i.id));

  const parsed = listingSchema.safeParse(raw);
  const fieldErrors = parsed.success ? {} : flattenErrors(parsed.error);
  if (remaining.length + photos.length === 0) fieldErrors.photos = "A listing needs at least one photo.";
  if (remaining.length + photos.length > MAX_PHOTOS) fieldErrors.photos = `A listing can have up to ${MAX_PHOTOS} photos.`;
  if (!parsed.success || Object.keys(fieldErrors).length) return { fieldErrors };

  const saved = await savePhotos(photos);
  if (saved.error) return { fieldErrors: { photos: saved.error } };

  const d = parsed.data;
  // Editing a live listing sends it back through review (unless an admin edits or auto-approve is on).
  const status = user.role === "admin" || autoApprove() ? (existing.status === "rejected" ? "pending" : existing.status) : "pending";

  await db
    .prepare(
      `UPDATE properties SET title=?, description=?, type=?, state=?, area=?, price_yearly=?, bedrooms=?, bathrooms=?,
         area_sqm=?, tag=?, amenities=?, status=? WHERE id=?`
    )
    .run(d.title, d.description, d.type, d.state, d.area, d.price, d.bedrooms, d.bathrooms, d.area_sqm, d.tag, JSON.stringify(amenities), status, id);
  for (const img of current.filter((i) => removeIds.includes(i.id))) {
    await db.prepare("DELETE FROM property_images WHERE id = ?").run(img.id);
    await deleteUpload(img.url);
  }
  const maxPosRow = (await db.prepare("SELECT COALESCE(MAX(position), -1) AS m FROM property_images WHERE property_id = ?").get(id)) as { m: number };
  const ins = db.prepare("INSERT INTO property_images (property_id, url, position) VALUES (?,?,?)");
  for (const [i, u] of saved.urls.entries()) await ins.run(id, u, maxPosRow.m + 1 + i);

  revalidatePath("/", "layout");
  redirect(`/dashboard?tab=listings&updated=${status}`);
}

export async function toggleRented(id: number) {
  const user = await requireUser(["landlord", "admin"]);
  const db = await getDb();
  await db
    .prepare("UPDATE properties SET rented = 1 - rented WHERE id = ? AND (owner_id = ? OR ? = 'admin')")
    .run(id, user.id, user.role);
  revalidatePath("/", "layout");
}

export async function deleteListing(id: number) {
  const user = await requireUser(["landlord", "admin"]);
  const db = await getDb();
  const owns = await db.prepare("SELECT 1 FROM properties WHERE id = ? AND (owner_id = ? OR ? = 'admin')").get(id, user.id, user.role);
  if (!owns) return;
  const imgs = (await db.prepare("SELECT url FROM property_images WHERE property_id = ?").all(id)) as { url: string }[];
  await db.prepare("DELETE FROM properties WHERE id = ?").run(id);
  for (const i of imgs) await deleteUpload(i.url);
  revalidatePath("/", "layout");
}
