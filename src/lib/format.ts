export function naira(n: number) {
  return "₦" + Math.round(n).toLocaleString("en-NG");
}

export function monthly(yearly: number) {
  return naira(yearly / 12);
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function listingPath(p: { id: number; title: string }) {
  return `/listings/${p.id}-${slugify(p.title)}`;
}

/** Convert a Nigerian phone number to international format for wa.me (no plus). */
export function toWhatsApp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  return "234" + digits;
}

export function telHref(phone: string) {
  return "tel:+" + toWhatsApp(phone);
}

export function timeAgo(iso: string) {
  const then = new Date(iso.replace(" ", "T") + (iso.includes("Z") ? "" : "Z")).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function shortDate(iso: string) {
  const d = new Date(iso.replace(" ", "T") + (iso.includes("Z") ? "" : "Z"));
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
