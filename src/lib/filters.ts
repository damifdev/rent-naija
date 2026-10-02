import { NIGERIAN_STATES, PROPERTY_TYPES } from "./constants";
import type { Filters } from "./queries";

type SP = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const num = (v: string) => {
  const n = Number(v.replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function parseFilters(sp: SP): Filters {
  const state = first(sp.state);
  const type = first(sp.type);
  const sort = first(sp.sort);
  return {
    q: first(sp.q).trim().slice(0, 80) || undefined,
    state: (NIGERIAN_STATES as readonly string[]).includes(state) ? state : undefined,
    area: first(sp.area).trim().slice(0, 60) || undefined,
    type: PROPERTY_TYPES.some((t) => t.value === type) ? type : undefined,
    min: num(first(sp.min)),
    max: num(first(sp.max)),
    beds: num(first(sp.beds)),
    baths: num(first(sp.baths)),
    sort: sort === "price_asc" || sort === "price_desc" ? sort : "newest",
    page: num(first(sp.page)) ?? 1,
  };
}

export function activeFilterCount(f: Filters) {
  return [f.state, f.area, f.type, f.min, f.max, f.beds, f.baths].filter(Boolean).length;
}

export function toQuery(f: Filters, override: Partial<Filters> = {}) {
  const m = { ...f, ...override };
  const p = new URLSearchParams();
  (["q", "state", "area", "type", "min", "max", "beds", "baths"] as const).forEach((k) => {
    if (m[k]) p.set(k, String(m[k]));
  });
  if (m.sort && m.sort !== "newest") p.set("sort", m.sort);
  if (m.page && m.page > 1) p.set("page", String(m.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}
