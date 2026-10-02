# Design and engineering decisions

Short notes to help explain the choices in the capstone presentation.

1. **Next.js App Router with Server Components and Server Actions.** Pages read the database on the server and send finished HTML, which suits slow mobile connections and gives search engines real content. Server Actions replace a separate REST API for forms (sign-up, inquiry, add listing), so there is less code and no duplicated validation.

2. **SQLite instead of Supabase/Postgres.** The original plan used Supabase. SQLite (Node's built-in `node:sqlite`, so nothing to compile on Windows) runs with `npm install` and no accounts, which makes the project easy to run, mark and demo offline. The data access is isolated in `lib/queries.ts` and `lib/actions/`, so a move to Postgres is contained (see README).

3. **Design from the Stitch export.** Colours, radii, the Plus Jakarta Sans type, chips, pill statuses, cards, bottom navigation, the stacked home search, horizontal featured row, filter drawer/sidebar, sticky mobile contact bar and dashboards all follow `DESIGN.md` and the screens. Where the design is mobile-only, desktop layouts were added using its stated rules (1200px max width, sidebar filters from 1024px, sticky contact aside).

4. **Rent shown per year, with an approximate monthly figure.** Annual rent is the norm in Nigerian listings; the monthly figure is yearly / 12 and labelled "About".

5. **Admin approval before listings go live.** Protects renters from fake or scam listings. Editing a live listing sends it back to review. `AUTO_APPROVE_LISTINGS=true` turns this off.

6. **"Verified" is a real flag.** The design shows "Verified" badges; here the badge appears only when an admin has marked that agent as verified. Nothing is shown that the system cannot back up. Likewise there are no invented statistics or response-time promises.

7. **Landlord and agent are one role.** The sign-up screen groups them ("Owners and agents"), and both need the same tools.

8. **Contact by phone and WhatsApp, plus a saved inquiry.** Renters in Nigeria expect to call or message directly, so those are one tap. The inquiry form adds a record the landlord can see and the renter can track (Sent / Seen).

9. **Security basics.** Passwords hashed with bcrypt; sessions are signed, httpOnly cookies; every action re-checks who the user is and who owns the record; all SQL is parameterised; uploads are limited by type and size; inquiry forms have a honeypot and rate limit; login attempts are rate limited.

10. **Forms submit through `onSubmit`.** React 19 clears uncontrolled fields after a form action. Submitting through `onSubmit` (see `components/useServerAction.ts`) keeps what the person typed when validation fails, which matters most on the long add-listing form.

11. **Search is plain SQL `LIKE` with indexes on state, area, price and status.** It is enough for thousands of listings. Full-text search would be the next step if the data grew.
