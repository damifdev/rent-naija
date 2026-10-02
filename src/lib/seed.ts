import type { Db } from "./db";
import bcrypt from "bcryptjs";

/**
 * Demo data so the app is useful on first run.
 * Photos are the shared placeholders from the Stitch design (public/images).
 * Phone numbers use the 555 range and are not real.
 */

const DEMO_PASSWORD = "Password123!";
const PHOTOS = {
  exterior: "/images/exterior.jpg",
  living: "/images/living.jpg",
  bedroom: "/images/bedroom.jpg",
};

type Seed = {
  owner: "chioma" | "ibrahim" | "babajide" | "emeka" | "ngozi";
  title: string;
  type: string;
  state: string;
  area: string;
  price: number;
  beds: number;
  baths: number;
  sqm?: number;
  tag?: string;
  amenities: string[];
  blurb: string;
  featured?: boolean;
  status?: "approved" | "pending" | "rejected";
  rented?: boolean;
  daysAgo: number;
};

const LISTINGS: Seed[] = [
  { owner: "chioma", title: "Serviced 2-Bedroom Flat, Lekki Phase 1", type: "flat", state: "Lagos", area: "Lekki Phase 1", price: 2400000, beds: 2, baths: 2, sqm: 90, tag: "Serviced", featured: true, daysAgo: 7,
    amenities: ["Water supply", "Prepaid meter", "Solar / inverter", "Security", "Parking space", "Fitted kitchen"],
    blurb: "Well-maintained 2-bedroom flat in a secure gated estate off Chevron Drive. The compound has uniform estate security with a 24/7 gate and clean paved access roads. Fitted with a personal prepaid meter and a dedicated water treatment system. Ideal for working professionals who want steady light and easy access to the Lekki-Epe expressway." },
  { owner: "chioma", title: "Modern 2 Bedroom Serviced Flat", type: "flat", state: "Lagos", area: "Lekki Phase 1", price: 4500000, beds: 2, baths: 2, sqm: 110, tag: "Serviced", featured: true, daysAgo: 3,
    amenities: ["Water supply", "Generator", "Security", "CCTV", "Parking space", "Air conditioning", "Fitted kitchen"],
    blurb: "Newly finished serviced flat with an open-plan living room, a fitted kitchen and split air conditioners in every room. The building has a standby generator, CCTV and a gateman on duty around the clock." },
  { owner: "chioma", title: "Spacious 1 Bedroom Mini Flat", type: "flat", state: "Lagos", area: "Ikate", price: 3200000, beds: 1, baths: 1, sqm: 62, tag: "Serviced", featured: true, daysAgo: 5,
    amenities: ["Water supply", "Prepaid meter", "Security", "Parking space", "Tiled floors"],
    blurb: "Bright mini flat in Ikate Elegushi with a large living area and a separate kitchen. Ten minutes from the Lekki toll gate and close to supermarkets and restaurants." },
  { owner: "chioma", title: "3-Bed Serviced Apartment, Ikate", type: "flat", state: "Lagos", area: "Ikate", price: 5800000, beds: 3, baths: 3, sqm: 140, tag: "Serviced", daysAgo: 9,
    amenities: ["Water supply", "Generator", "Security", "CCTV", "Balcony", "Parking space", "Air conditioning"],
    blurb: "Three en-suite bedrooms with balconies in a small serviced block. Cleaning of the common areas, waste disposal and estate security are covered by the service charge." },
  { owner: "chioma", title: "1-Bed Studio Apartment", type: "flat", state: "Lagos", area: "Lekki Phase 1", price: 1800000, beds: 1, baths: 1, sqm: 45, daysAgo: 12,
    amenities: ["Water supply", "Prepaid meter", "Wardrobes", "Tiled floors", "Security"],
    blurb: "Compact studio with a fitted wardrobe, kitchenette and its own prepaid meter. Suits a single professional who wants to be close to the Lekki business district." },
  { owner: "chioma", title: "4 Bedroom Detached Duplex, Magodo", type: "duplex", state: "Lagos", area: "Magodo", price: 9000000, beds: 4, baths: 5, sqm: 320, tag: "Gated estate", featured: true, daysAgo: 15,
    amenities: ["Water supply", "Generator", "Gated estate", "Security", "Parking space", "Boys' quarters", "Good road"],
    blurb: "Detached family duplex in Magodo Phase 2 with a large compound, a boys' quarters and space for four cars. The estate has a functioning drainage system and good roads." },
  { owner: "chioma", title: "3 Bedroom Terrace, Ajah", type: "terrace", state: "Lagos", area: "Ajah", price: 3500000, beds: 3, baths: 3, sqm: 165, daysAgo: 1, status: "pending",
    amenities: ["Water supply", "Security", "Parking space", "Fitted kitchen", "Wardrobes"],
    blurb: "Newly built terrace in a quiet estate near the Ajah bridge. Fitted kitchen, wardrobes in all rooms and a shared borehole." },
  { owner: "chioma", title: "2 Bedroom Flat, Ikeja GRA", type: "flat", state: "Lagos", area: "Ikeja GRA", price: 3000000, beds: 2, baths: 2, sqm: 100, daysAgo: 18,
    amenities: ["Water supply", "Prepaid meter", "Security", "Parking space", "Good road", "Tiled floors"],
    blurb: "Quiet flat in Ikeja GRA, a short drive from the airport and Allen Avenue. Tree-lined street, steady water and a reliable gateman." },
  { owner: "chioma", title: "Self-Contain, Yaba", type: "self_contain", state: "Lagos", area: "Yaba", price: 650000, beds: 1, baths: 1, sqm: 28, daysAgo: 21,
    amenities: ["Water supply", "Prepaid meter", "Tiled floors"],
    blurb: "Tidy self-contain with a private kitchen and toilet, walking distance from the university and the Yaba tech cluster. Prepaid meter installed." },
  { owner: "chioma", title: "Luxury 2 Bed Apartment, Victoria Island", type: "flat", state: "Lagos", area: "Victoria Island", price: 12000000, beds: 2, baths: 3, sqm: 155, tag: "Furnished", featured: true, daysAgo: 25,
    amenities: ["Furnished", "Water supply", "Generator", "Swimming pool", "Security", "CCTV", "Air conditioning", "Parking space"],
    blurb: "Fully furnished apartment with a pool and gym access, 24-hour power and concierge security. Minutes from the corporate offices on Adeola Odeku." },

  { owner: "ibrahim", title: "Executive 3-Bedroom Apartment, Wuse 2", type: "flat", state: "Abuja (FCT)", area: "Wuse 2", price: 4800000, beds: 3, baths: 3, sqm: 150, featured: true, daysAgo: 4,
    amenities: ["Water supply", "Generator", "Security", "Parking space", "Air conditioning", "Fitted kitchen"],
    blurb: "Executive apartment off Aminu Kano Crescent with three en-suite bedrooms, a guest toilet and a standby generator. Walking distance to restaurants and the Wuse market." },
  { owner: "ibrahim", title: "2 Bedroom Flat, Gwarinpa", type: "flat", state: "Abuja (FCT)", area: "Gwarinpa", price: 2800000, beds: 2, baths: 2, sqm: 95, daysAgo: 8,
    amenities: ["Water supply", "Prepaid meter", "Security", "Parking space", "Good road"],
    blurb: "Well-kept flat on the 3rd Avenue side of Gwarinpa. Steady water, tarred road to the gate and a short drive to Kado and Jabi." },
  { owner: "ibrahim", title: "4 Bedroom Duplex, Maitama", type: "duplex", state: "Abuja (FCT)", area: "Maitama", price: 18000000, beds: 4, baths: 5, sqm: 380, featured: true, daysAgo: 10,
    amenities: ["Water supply", "Generator", "Security", "CCTV", "Boys' quarters", "Parking space", "Air conditioning", "Gated estate"],
    blurb: "Spacious duplex in Maitama with a boys' quarters, a large lounge and a landscaped compound. Round-the-clock security and a standby generator." },
  { owner: "ibrahim", title: "Self-Contain, Kubwa", type: "self_contain", state: "Abuja (FCT)", area: "Kubwa", price: 500000, beds: 1, baths: 1, sqm: 30, rented: true, daysAgo: 14,
    amenities: ["Water supply", "Prepaid meter", "Tiled floors"],
    blurb: "Affordable self-contain close to the Kubwa expressway with a private kitchen and toilet." },
  { owner: "ibrahim", title: "3 Bedroom Bungalow, Lugbe", type: "bungalow", state: "Abuja (FCT)", area: "Lugbe", price: 1900000, beds: 3, baths: 3, sqm: 180, daysAgo: 20,
    amenities: ["Water supply", "Security", "Parking space", "Fitted kitchen", "Tiled floors"],
    blurb: "Single-storey bungalow with three bedrooms, a fitted kitchen and a fenced compound, a few minutes from the airport road." },

  { owner: "emeka", title: "Self-Contain Studio Apartment, Trans Amadi", type: "self_contain", state: "Rivers", area: "Trans Amadi", price: 900000, beds: 1, baths: 1, sqm: 35, daysAgo: 30,
    amenities: ["Water supply", "Prepaid meter", "Security", "Tiled floors"],
    blurb: "Studio apartment off Industrial Layout with a private kitchen, tiled floors and steady water. Popular with oil and gas contractors." },
  { owner: "emeka", title: "3 Bedroom Flat, GRA Phase 2", type: "flat", state: "Rivers", area: "GRA Phase 2", price: 3600000, beds: 3, baths: 3, sqm: 145, daysAgo: 6,
    amenities: ["Water supply", "Generator", "Security", "Parking space", "Fitted kitchen", "Air conditioning"],
    blurb: "Spacious flat in Old GRA Phase 2 with three en-suite bedrooms and a large living room. Quiet, secure street." },
  { owner: "emeka", title: "2 Bedroom Flat, Rumuola", type: "flat", state: "Rivers", area: "Rumuola", price: 1500000, beds: 2, baths: 2, sqm: 85, daysAgo: 11,
    amenities: ["Water supply", "Prepaid meter", "Security", "Parking space"],
    blurb: "Two-bedroom flat on the Rumuola axis with easy access to Ada George Road and the city centre." },
  { owner: "emeka", title: "4 Bedroom Duplex, Eliozu", type: "duplex", state: "Rivers", area: "Eliozu", price: 4500000, beds: 4, baths: 5, sqm: 300, daysAgo: 2, status: "pending",
    amenities: ["Water supply", "Generator", "Gated estate", "Security", "Boys' quarters", "Parking space"],
    blurb: "Newly built duplex in a gated estate with a boys' quarters and its own borehole." },

  { owner: "babajide", title: "3-Bedroom Semi-Detached Duplex, Bodija", type: "duplex", state: "Oyo", area: "Bodija", price: 2200000, beds: 3, baths: 3, sqm: 210, tag: "Estate fee included", featured: true, daysAgo: 5,
    amenities: ["Gated estate", "Water supply", "Security", "Parking space", "Good road", "Fitted kitchen"],
    blurb: "Semi-detached duplex in a gated Bodija estate with ample parking. The estate fee is included in the rent, and the road is tarred all the way to the gate." },
  { owner: "babajide", title: "2 Bedroom Flat, Akobo", type: "flat", state: "Oyo", area: "Akobo", price: 800000, beds: 2, baths: 2, sqm: 80, daysAgo: 13,
    amenities: ["Water supply", "Prepaid meter", "Security", "Tiled floors"],
    blurb: "Neat two-bedroom flat in Akobo with a large living room, a prepaid meter and steady water from a borehole." },
  { owner: "babajide", title: "Clean Single Room, Challenge", type: "room", state: "Oyo", area: "Challenge", price: 250000, beds: 1, baths: 1, sqm: 18, daysAgo: 17,
    amenities: ["Water supply", "Prepaid meter"],
    blurb: "Single room with a shared bathroom in a quiet compound, five minutes from the Challenge bus stop." },
  { owner: "babajide", title: "4 Bedroom Bungalow, Oluyole", type: "bungalow", state: "Oyo", area: "Oluyole", price: 3000000, beds: 4, baths: 4, sqm: 260, daysAgo: 22,
    amenities: ["Water supply", "Generator", "Security", "Parking space", "Boys' quarters", "Gated estate"],
    blurb: "Large bungalow in the Oluyole estate with four bedrooms, a boys' quarters and a wide compound." },

  { owner: "ngozi", title: "3 Bedroom Flat, New Haven", type: "flat", state: "Enugu", area: "New Haven", price: 1800000, beds: 3, baths: 3, sqm: 130, featured: true, daysAgo: 6,
    amenities: ["Water supply", "Prepaid meter", "Security", "Parking space", "Fitted kitchen", "Good road"],
    blurb: "Three-bedroom flat in New Haven, close to shops, schools and the Ogui Road junction. Steady water and a reliable gateman." },
  { owner: "ngozi", title: "2 Bedroom Flat, Independence Layout", type: "flat", state: "Enugu", area: "Independence Layout", price: 1200000, beds: 2, baths: 2, sqm: 90, daysAgo: 16,
    amenities: ["Water supply", "Prepaid meter", "Security", "Parking space"],
    blurb: "Quiet two-bedroom flat in Independence Layout, a short walk from the GRA and the Enugu Club." },
  { owner: "ngozi", title: "Self-Contain, Trans-Ekulu", type: "self_contain", state: "Enugu", area: "Trans-Ekulu", price: 400000, beds: 1, baths: 1, sqm: 28, daysAgo: 19,
    amenities: ["Water supply", "Prepaid meter", "Tiled floors"],
    blurb: "Simple self-contain with a private kitchen and toilet near the Trans-Ekulu axis." },
  { owner: "ngozi", title: "4 Bedroom Duplex, GRA Enugu", type: "duplex", state: "Enugu", area: "GRA Enugu", price: 3000000, beds: 4, baths: 5, sqm: 290, daysAgo: 24,
    amenities: ["Water supply", "Generator", "Security", "Boys' quarters", "Parking space", "Air conditioning", "Good road"],
    blurb: "Family duplex in Enugu GRA with a boys' quarters, a big compound and a quiet, shaded street." },
];

export function seedDatabase(db: Db) {
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@rentnaija.test").toLowerCase();
  const adminHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "Admin123!", 10);

  const insertUser = db.prepare(
    `INSERT INTO users (name, email, phone, password_hash, role, agency, avatar_url, verified)
     VALUES (@name, @email, @phone, @hash, @role, @agency, @avatar, @verified)`
  );
  const user = (u: {
    name: string; email: string; phone: string; role: string;
    agency?: string; avatar?: string; verified?: number; hash?: string;
  }) =>
    Number(
      insertUser.run({
        agency: null, avatar: null, verified: 0, hash, ...u,
      }).lastInsertRowid
    );

  const tx = db.transaction(() => {
    user({ name: "RentNaija Admin", email: adminEmail, phone: "", role: "admin", hash: adminHash, verified: 1 });

    const owners = {
      chioma: user({ name: "Chioma Okeke", email: "chioma@rentnaija.test", phone: "0803 555 0142", role: "landlord", agency: "Lekki Hub", avatar: "/images/agent-chioma.jpg", verified: 1 }),
      ibrahim: user({ name: "Ibrahim Danladi", email: "ibrahim@rentnaija.test", phone: "0812 555 0188", role: "landlord", agency: "Capital Homes Abuja", verified: 1 }),
      babajide: user({ name: "Babajide Shittu", email: "babajide@rentnaija.test", phone: "0806 555 0119", role: "landlord", agency: "Premier Properties", verified: 1 }),
      emeka: user({ name: "Emeka Nwosu", email: "emeka@rentnaija.test", phone: "0809 555 0163", role: "landlord", agency: "Garden City Realty" }),
      ngozi: user({ name: "Ngozi Eze", email: "ngozi@rentnaija.test", phone: "0805 555 0127", role: "landlord", agency: "Coal City Lettings", verified: 1 }),
    };
    const tunde = user({ name: "Tunde Adeyemi", email: "tunde@rentnaija.test", phone: "0803 555 0294", role: "tenant" });
    const amina = user({ name: "Amina Bello", email: "amina@rentnaija.test", phone: "0812 555 0942", role: "tenant" });

    const insertProp = db.prepare(
      `INSERT INTO properties (owner_id, title, description, type, state, area, price_yearly, bedrooms, bathrooms,
         area_sqm, tag, amenities, status, rented, featured, created_at)
       VALUES (@owner, @title, @desc, @type, @state, @area, @price, @beds, @baths, @sqm, @tag, @amenities,
         @status, @rented, @featured, datetime('now', @ago))`
    );
    const insertImg = db.prepare(
      "INSERT INTO property_images (property_id, url, position) VALUES (?, ?, ?)"
    );

    const ids: number[] = [];
    LISTINGS.forEach((l, i) => {
      const id = Number(
        insertProp.run({
          owner: owners[l.owner],
          title: l.title,
          desc: l.blurb,
          type: l.type,
          state: l.state,
          area: l.area,
          price: l.price,
          beds: l.beds,
          baths: l.baths,
          sqm: l.sqm ?? null,
          tag: l.tag ?? null,
          amenities: JSON.stringify(l.amenities),
          status: l.status ?? "approved",
          rented: l.rented ? 1 : 0,
          featured: l.featured ? 1 : 0,
          ago: `-${l.daysAgo} days`,
        }).lastInsertRowid
      );
      ids.push(id);
      const base = ["living", "bedroom", "exterior"] as const;
      const order =
        l.type === "flat"
          ? [...base]
          : l.type === "room" || l.type === "self_contain"
          ? ["bedroom", "living", "exterior"]
          : ["exterior", "living", "bedroom"];
      const rot = i % 3;
      const rotated = [...order.slice(rot), ...order.slice(0, rot)] as (keyof typeof PHOTOS)[];
      // Duplexes/bungalows lead with the building; keep that regardless of rotation.
      const final = ["duplex", "bungalow", "terrace"].includes(l.type) ? (order as (keyof typeof PHOTOS)[]) : rotated;
      final.forEach((k, pos) => insertImg.run(id, PHOTOS[k], pos));
    });

    const inquiry = db.prepare(
      `INSERT INTO inquiries (property_id, sender_id, name, phone, message, read_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))`
    );
    inquiry.run(ids[0], tunde, "Tunde Adeyemi", "0803 555 0294",
      "Good afternoon Chioma. Is this Lekki flat still available for inspection this Saturday around 11:00 AM? I am pre-approved for immediate move-in.",
      null, "-2 hours");
    inquiry.run(ids[10], amina, "Amina Bello", "0812 555 0942",
      "Hello, does the service charge cover 24-hour generator power and security in the estate? Kindly confirm before I proceed with agency fee.",
      null, "-1 days");
    inquiry.run(ids[19], tunde, "Tunde Adeyemi", "0803 555 0294",
      "I would like to inspect this weekend. Can you share the service charge breakdown?",
      "2026-09-18 10:00:00", "-1 days");

    const fav = db.prepare("INSERT INTO favorites (user_id, property_id) VALUES (?, ?)");
    fav.run(tunde, ids[1]);
    fav.run(tunde, ids[19]);
    fav.run(amina, ids[12]);
  });
  tx();
}
