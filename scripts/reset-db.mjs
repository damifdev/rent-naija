// Deletes the local SQLite database (and uploaded photos) so the demo data is re-seeded on next start.
import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data");
for (const f of fs.readdirSync(dir)) {
  if (f.startsWith("rentnaija.db")) fs.rmSync(path.join(dir, f));
}
const up = path.join(dir, "uploads");
if (fs.existsSync(up)) for (const f of fs.readdirSync(up)) if (f !== ".gitkeep") fs.rmSync(path.join(up, f));
console.log("Database reset. It will be re-seeded the next time the app starts.");
