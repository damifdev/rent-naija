import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { UPLOAD_DIR } from "./db";

const EXT: Record<string, string> = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
const MAX_BYTES = 10 * 1024 * 1024;

/** True when deployed somewhere with Vercel Blob configured (e.g. Vercel itself). Hosts with a
 *  normal writable disk (local dev, Render) don't need it and fall back to local files below. */
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Saves one uploaded photo and returns its public URL.
 * - With BLOB_READ_WRITE_TOKEN set (Vercel): uploads to Vercel Blob, which is how file storage
 *   works on serverless hosts that have no writable, persistent local disk.
 * - Otherwise: writes to the local data/uploads folder, served back by the /media/[name] route.
 */
export async function saveUpload(file: File): Promise<{ url: string } | { error: string }> {
  const ext = EXT[file.type];
  if (!ext) return { error: "Photos must be JPG, PNG or WebP files." };
  if (file.size > MAX_BYTES) return { error: `${file.name} is larger than 10MB.` };
  const name = crypto.randomUUID() + ext;

  if (useBlob()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public" });
    return { url: blob.url };
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/media/${name}` };
}

/** Deletes a previously uploaded photo. Bundled demo photos (/images/...) are never deleted. */
export async function deleteUpload(url: string) {
  if (url.startsWith("/media/")) {
    fs.rm(path.join(UPLOAD_DIR, path.basename(url)), { force: true }, () => {});
    return;
  }
  if (useBlob() && /^https:\/\/[^/]*\.blob\.vercel-storage\.com\//.test(url)) {
    const { del } = await import("@vercel/blob");
    await del(url).catch(() => {});
  }
}
