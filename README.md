# RentNaija

A house-rental platform for Nigeria. Renters browse homes, filter by location and price, view full details and contact the landlord or agent. Landlords and agents list and manage properties. An admin reviews every listing before it goes live.

Built as a capstone project. The UI follows the Stitch design saved in `design/` (colours, type, components and layout come from `design/DESIGN.md`; the screen mock-ups are in `design/screens/`).

## Features

| Area | What it does |
| --- | --- |
| Browse and search | Listings grid, keyword/location search, filter by state, area, price range, property type, bedrooms and bathrooms, sort (newest, price low-high, price high-low), pagination |
| Property details | Photo gallery, price per year and approximate monthly figure, key details, overview, amenities, agent card, similar homes, open in maps, share |
| Contact | Call (`tel:`) and WhatsApp (`wa.me`) buttons, plus an inspection request form saved to the database (honeypot and rate limit against spam) |
| Accounts | Email and password sign-up with role choice (renter, or landlord/agent), login, logout |
| Renter dashboard | Saved homes (heart button) and sent inquiries with Sent/Seen status |
| Landlord dashboard | Add, edit, delete listings, multi-photo upload, mark rented / relist, inquiry inbox with mark-as-read, WhatsApp and call buttons |
| Admin | Approve or reject listings, feature listings, verify agents, remove users |
| Quality | Mobile-first, responsive to desktop, skeleton loaders, empty and error states, keyboard and screen-reader friendly, SEO metadata |

## Tech stack

- Next.js 15 (App Router, Server Components, Server Actions) and TypeScript
- Tailwind CSS 3 with the Stitch design tokens, Plus Jakarta Sans, lucide icons
- SQLite through Node's built-in `node:sqlite` module (a single file in `data/`, no database server and no native packages to compile)
- Sessions: signed JWT in an httpOnly cookie (`jose`), passwords hashed with `bcryptjs`
- Validation: `zod`

## Run it

Requires Node.js 22.13 or newer (Node 24 works). Node prints a one-line "SQLite is an experimental feature" warning; it is harmless.

```bash
npm install
cp .env.example .env.local     # then set SESSION_SECRET to a long random string
npm run dev                    # http://localhost:3000
```

The database is created and filled with 27 demo listings the first time the app starts. To start over: `npm run db:reset`.

Production build: `npm run build && npm start`.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@rentnaija.test` | `Admin123!` (or `ADMIN_PASSWORD` from `.env.local`) |
| Landlord / agent (verified, Lagos) | `chioma@rentnaija.test` | `Password123!` |
| Other agents | `ibrahim@`, `babajide@`, `emeka@`, `ngozi@rentnaija.test` | `Password123!` |
| Renter | `tunde@rentnaija.test`, `amina@rentnaija.test` | `Password123!` |

Change or delete these before putting the app anywhere public. Phone numbers in the demo data use the 555 range and are not real.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `SESSION_SECRET` | Signs login cookies. **Set this.** | insecure dev value |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account, created on first run | `admin@rentnaija.test` / `Admin123!` |
| `AUTO_APPROVE_LISTINGS` | `true` skips admin review | `false` |
| `NEXT_PUBLIC_SITE_URL` | Used for absolute URLs in page metadata | `http://localhost:3000` |

## Project structure

```
src/
  app/                    Routes (pages and route handlers)
    page.tsx              Home
    listings/             Search results and property details
    login/ signup/        Authentication
    dashboard/            Renter and landlord dashboards, add/edit listing
    admin/                Admin review screen
    media/[name]/         Serves uploaded photos from data/uploads
  components/             UI components (cards, filters, gallery, forms, dashboards)
  lib/
    db.ts, seed.ts        SQLite schema, connection, demo data
    queries.ts            All read queries (search, details, dashboards)
    actions/              Server Actions: auth, listings, inquiries/favourites, admin
    auth.ts               Session cookie, current user, role guards
    validation.ts         zod schemas
    ratelimit.ts          Small in-memory rate limiter
  middleware.ts           Redirects logged-out visitors away from /dashboard and /admin
public/images/            Photos and agent portrait from the Stitch design
data/                     SQLite database and uploaded photos (git-ignored)
```

### Data model

`users` (role: tenant, landlord, admin; `verified` badge set by admin) -> `properties` (status: pending, approved, rejected; `rented`, `featured`) -> `property_images`, `inquiries`; `favorites` joins users and properties. Indexes cover state, area, price, status and owner. See `src/lib/db.ts`.

## How it was checked

There is no automated test suite in the repo. The app was built for production (`next build`, type-checked) and exercised in a headless browser at phone and desktop widths: sign-up validation (input preserved after errors), sign-up, login and wrong-password handling, saving a home, sending an inquiry (validation and success), landlord inbox and mark-as-read, creating a listing with a photo upload, hiding pending listings from the public, admin approval making the listing appear, role protection (a renter is redirected away from `/admin` and the add-listing page), and the mobile filter drawer.

Manual checklist for your demo: see the flows above, plus filters (`/listings?state=Lagos&type=flat&beds=2&max=5000000`) and sort.

## Known limits and next steps

- **Windows note:** the app has no native dependencies, so `npm install` needs no Visual Studio or Python. If `npm install` reports `EBUSY` or locked folders, close editors and terminals that are using the folder, delete `node_modules`, and run it again. Folders synced by OneDrive can cause this, so a path like `C:\dev\rentnaija` is safer.
- **Deployment:** SQLite is a file, so host on something with a persistent disk (Railway, Render, Fly.io with a volume, or a VPS). It will not persist on Vercel. To use Vercel, move the data layer to Postgres (Supabase or Neon): the SQL in `src/lib/db.ts` is plain and `src/lib/queries.ts` holds the reads, so the change is contained.
- Uploaded photos are stored on local disk (`data/uploads`). Use object storage (Supabase Storage, S3, Cloudinary) for real deployment.
- The rate limiter is in memory, so it resets on restart and does not span several servers.
- No email or password reset, and no email verification.
- Demo listing photos are the shared placeholders from the Stitch design, reused across listings.
- "Verified" on an agent means an admin ticked it. Nothing checks identity documents.
- Terms of Service and Privacy Policy are placeholders.
