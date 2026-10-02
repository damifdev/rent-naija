import "server-only";
import { getDb } from "./db";
import { PAGE_SIZE } from "./constants";

export type Card = {
  id: number;
  title: string;
  type: string;
  state: string;
  area: string;
  price_yearly: number;
  bedrooms: number;
  bathrooms: number;
  tag: string | null;
  status: "pending" | "approved" | "rejected";
  rented: number;
  featured: number;
  created_at: string;
  cover: string | null;
  owner_id: number;
  owner_name: string;
  owner_agency: string | null;
  owner_avatar: string | null;
  owner_verified: number;
  owner_phone: string;
  saved: number;
};

export type Detail = Card & {
  description: string;
  area_sqm: number | null;
  amenities: string[];
  images: { id: number; url: string }[];
};

export type Filters = {
  q?: string;
  state?: string;
  area?: string;
  type?: string;
  min?: number;
  max?: number;
  beds?: number;
  baths?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
};

const CARD_SELECT = `
  SELECT p.id, p.title, p.type, p.state, p.area, p.price_yearly, p.bedrooms, p.bathrooms,
    p.tag, p.status, p.rented, p.featured, p.created_at, p.owner_id,
    (SELECT url FROM property_images i WHERE i.property_id = p.id ORDER BY position, id LIMIT 1) AS cover,
    u.name AS owner_name, u.agency AS owner_agency, u.avatar_url AS owner_avatar,
    u.verified AS owner_verified, u.phone AS owner_phone,
    EXISTS(SELECT 1 FROM favorites f WHERE f.property_id = p.id AND f.user_id = @uid) AS saved
  FROM properties p JOIN users u ON u.id = p.owner_id`;

const esc = (s: string) => s.replace(/[\\%_]/g, (m) => "\\" + m);

export function searchProperties(f: Filters, userId: number | null) {
  const where: string[] = ["p.status = 'approved'", "p.rented = 0"];
  const params: Record<string, string | number | null> = { uid: userId ?? 0 };

  if (f.q) {
    f.q
      .split(/[,\s]+/)
      .filter((t) => t.length > 1)
      .slice(0, 6)
      .forEach((tok, i) => {
        params[`q${i}`] = `%${esc(tok)}%`;
        where.push(
          `(p.title LIKE @q${i} ESCAPE '\\' OR p.area LIKE @q${i} ESCAPE '\\' OR p.state LIKE @q${i} ESCAPE '\\')`
        );
      });
  }
  if (f.state) { where.push("p.state = @state"); params.state = f.state; }
  if (f.area) { where.push("p.area LIKE @area ESCAPE '\\'"); params.area = `%${esc(f.area)}%`; }
  if (f.type) { where.push("p.type = @type"); params.type = f.type; }
  if (f.min) { where.push("p.price_yearly >= @min"); params.min = f.min; }
  if (f.max) { where.push("p.price_yearly <= @max"); params.max = f.max; }
  if (f.beds) { where.push("p.bedrooms >= @beds"); params.beds = f.beds; }
  if (f.baths) { where.push("p.bathrooms >= @baths"); params.baths = f.baths; }

  const order =
    f.sort === "price_asc" ? "p.price_yearly ASC, p.id DESC"
    : f.sort === "price_desc" ? "p.price_yearly DESC, p.id DESC"
    : "p.created_at DESC, p.id DESC";

  const db = getDb();
  const whereSql = where.join(" AND ");
  const { n } = db
    .prepare(`SELECT COUNT(*) AS n FROM properties p WHERE ${whereSql}`)
    .get(params) as { n: number };
  const page = Math.max(1, f.page ?? 1);
  const items = db
    .prepare(`${CARD_SELECT} WHERE ${whereSql} ORDER BY ${order} LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}`)
    .all(params) as Card[];
  return { items, total: n, page, pages: Math.max(1, Math.ceil(n / PAGE_SIZE)) };
}

export function featuredProperties(userId: number | null, limit = 8) {
  return getDb()
    .prepare(
      `${CARD_SELECT} WHERE p.status='approved' AND p.rented=0 AND p.featured=1
       ORDER BY p.created_at DESC LIMIT ${limit}`
    )
    .all({ uid: userId ?? 0 }) as Card[];
}

export function countApproved() {
  return (getDb()
    .prepare("SELECT COUNT(*) AS n FROM properties WHERE status='approved' AND rented=0")
    .get() as { n: number }).n;
}

export function countByArea(q: string) {
  return (getDb()
    .prepare(
      "SELECT COUNT(*) AS n FROM properties WHERE status='approved' AND rented=0 AND (area LIKE ? ESCAPE '\\' OR title LIKE ? ESCAPE '\\')"
    )
    .get(`%${esc(q)}%`, `%${esc(q)}%`) as { n: number }).n;
}

export function getProperty(id: number, userId: number | null): Detail | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT c.*, p.description, p.area_sqm, p.amenities FROM (${CARD_SELECT} WHERE p.id = @id) c JOIN properties p ON p.id = c.id`)
    .get({ id, uid: userId ?? 0 }) as (Card & { description: string; area_sqm: number | null; amenities: string }) | undefined;
  if (!row) return null;
  const images = db
    .prepare("SELECT id, url FROM property_images WHERE property_id = ? ORDER BY position, id")
    .all(id) as { id: number; url: string }[];
  return { ...row, amenities: JSON.parse(row.amenities || "[]"), images };
}

export function similarProperties(p: Card, userId: number | null, limit = 6) {
  return getDb()
    .prepare(
      `${CARD_SELECT} WHERE p.status='approved' AND p.rented=0 AND p.id != @id AND p.state = @state
       ORDER BY (p.area = @area) DESC, (p.type = @type) DESC, ABS(p.price_yearly - @price) ASC LIMIT ${limit}`
    )
    .all({ uid: userId ?? 0, id: p.id, state: p.state, area: p.area, type: p.type, price: p.price_yearly }) as Card[];
}

export function ownerProperties(ownerId: number) {
  return getDb()
    .prepare(`${CARD_SELECT} WHERE p.owner_id = @owner ORDER BY p.created_at DESC, p.id DESC`)
    .all({ uid: 0, owner: ownerId }) as Card[];
}

export function savedProperties(userId: number) {
  return getDb()
    .prepare(
      `${CARD_SELECT} JOIN favorites fv ON fv.property_id = p.id AND fv.user_id = @uid
       WHERE p.status='approved' ORDER BY fv.created_at DESC`
    )
    .all({ uid: userId }) as Card[];
}

export type InquiryRow = {
  id: number;
  property_id: number;
  property_title: string;
  property_area: string;
  property_state: string;
  cover: string | null;
  name: string;
  phone: string;
  message: string;
  read_at: string | null;
  created_at: string;
  owner_name: string;
  owner_agency: string | null;
};

const INQ_SELECT = `
  SELECT q.id, q.property_id, p.title AS property_title, p.area AS property_area, p.state AS property_state,
    (SELECT url FROM property_images i WHERE i.property_id = p.id ORDER BY position, id LIMIT 1) AS cover,
    q.name, q.phone, q.message, q.read_at, q.created_at,
    u.name AS owner_name, u.agency AS owner_agency
  FROM inquiries q JOIN properties p ON p.id = q.property_id JOIN users u ON u.id = p.owner_id`;

export const inquiriesForOwner = (ownerId: number) =>
  getDb().prepare(`${INQ_SELECT} WHERE p.owner_id = ? ORDER BY q.created_at DESC, q.id DESC`).all(ownerId) as InquiryRow[];

export const inquiriesBySender = (userId: number) =>
  getDb().prepare(`${INQ_SELECT} WHERE q.sender_id = ? ORDER BY q.created_at DESC, q.id DESC`).all(userId) as InquiryRow[];

export function adminOverview() {
  const db = getDb();
  return {
    pending: db.prepare(`${CARD_SELECT} WHERE p.status='pending' ORDER BY p.created_at ASC`).all({ uid: 0 }) as Card[],
    all: db.prepare(`${CARD_SELECT} WHERE p.status != 'pending' ORDER BY p.created_at DESC`).all({ uid: 0 }) as Card[],
    users: db
      .prepare(
        `SELECT u.id, u.name, u.email, u.role, u.agency, u.verified, u.created_at,
           (SELECT COUNT(*) FROM properties p WHERE p.owner_id = u.id) AS listings
         FROM users u ORDER BY u.created_at DESC, u.id DESC`
      )
      .all() as { id: number; name: string; email: string; role: string; agency: string | null; verified: number; created_at: string; listings: number }[],
  };
}
