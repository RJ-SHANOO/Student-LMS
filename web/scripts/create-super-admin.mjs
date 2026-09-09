// Bootstraps a Super Admin account. There's no self-registration flow for
// this role by design (Section 1: "this is SOIL's own team") — run this
// script directly against your database instead.
//
// Usage:
//   node scripts/create-super-admin.mjs "Jane Doe" jane@soil.dev "a-strong-password"
//
// Reads MONGODB_URI / MONGODB_DB from .env.local (same file Next.js uses).

import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

function loadEnvLocal() {
  try {
    const contents = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of contents.split("\n")) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  } catch {
    // .env.local not found — assume env vars are set another way.
  }
}

loadEnvLocal();

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password) {
  console.error('Usage: node scripts/create-super-admin.mjs "Name" email@example.com password');
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set (checked .env.local and the environment).");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "soil");
const superAdmins = db.collection("superAdmins");

await superAdmins.createIndex({ email: 1 }, { unique: true });

const existing = await superAdmins.findOne({ email: email.toLowerCase() });
if (existing) {
  console.error(`A super admin with email ${email} already exists.`);
  await client.close();
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);
await superAdmins.insertOne({
  name,
  email: email.toLowerCase(),
  passwordHash,
  createdAt: new Date(),
});

console.log(`Super admin created: ${email}`);
await client.close();
