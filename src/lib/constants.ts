export const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
  "Ebonyi","Edo","Ekiti","Enugu","Abuja (FCT)","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina",
  "Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers",
  "Sokoto","Taraba","Yobe","Zamfara",
] as const;

export const PROPERTY_TYPES = [
  { value: "room", label: "Single room" },
  { value: "self_contain", label: "Self-contain" },
  { value: "flat", label: "Flat / apartment" },
  { value: "terrace", label: "Terrace" },
  { value: "bungalow", label: "Bungalow" },
  { value: "duplex", label: "Duplex" },
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number]["value"];

export const typeShort = (v: string) => ({ flat: "Flat", self_contain: "Self-contain", room: "Room", terrace: "Terrace", bungalow: "Bungalow", duplex: "Duplex" } as Record<string, string>)[v] ?? v;

export const typeLabel = (v: string) =>
  PROPERTY_TYPES.find((t) => t.value === v)?.label ?? v;

export const AMENITIES = [
  "Water supply",
  "Prepaid meter",
  "Generator",
  "Solar / inverter",
  "Security",
  "Gated estate",
  "Parking space",
  "Fitted kitchen",
  "Wardrobes",
  "Air conditioning",
  "Furnished",
  "Tiled floors",
  "Boys' quarters",
  "Balcony",
  "Swimming pool",
  "CCTV",
  "Good road",
] as const;

export const PRICE_PRESETS = [
  { label: "Any budget", value: "" },
  { label: "Up to ₦500,000", value: "500000" },
  { label: "Up to ₦1,000,000", value: "1000000" },
  { label: "Up to ₦2,000,000", value: "2000000" },
  { label: "Up to ₦5,000,000", value: "5000000" },
  { label: "Up to ₦10,000,000", value: "10000000" },
] as const;

export const PAGE_SIZE = 9;

/** Area suggestions shown as chips in the filter panel and the listing form. */
export const AREAS: Record<string, string[]> = {
  Lagos: ["Lekki Phase 1", "Ikate", "Chevron Drive", "Agungi", "Osapa London", "Ajah", "Ikeja GRA", "Magodo", "Yaba", "Surulere", "Victoria Island"],
  "Abuja (FCT)": ["Wuse 2", "Maitama", "Gwarinpa", "Jabi", "Lugbe", "Kubwa"],
  Rivers: ["GRA Phase 2", "Trans Amadi", "Rumuola", "Eliozu", "Old GRA"],
  Oyo: ["Bodija", "Akobo", "Oluyole", "Challenge", "Ring Road"],
  Enugu: ["New Haven", "Independence Layout", "Trans-Ekulu", "GRA Enugu"],
};

export const POPULAR_LOCATIONS = [
  { area: "Lekki", city: "Lagos", q: "Lekki" },
  { area: "Wuse 2", city: "Abuja", q: "Wuse 2" },
  { area: "Trans Amadi", city: "Port Harcourt", q: "Trans Amadi" },
  { area: "Bodija", city: "Ibadan", q: "Bodija" },
  { area: "New Haven", city: "Enugu", q: "New Haven" },
  { area: "Ikeja GRA", city: "Lagos", q: "Ikeja GRA" },
] as const;

export const shortState = (s: string) => s.replace(/\s*\(.*\)/, "");
export const locationLabel = (area: string, state: string) => `${area}, ${shortState(state)}`;
