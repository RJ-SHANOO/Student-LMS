import { MongoMemoryServer } from "mongodb-memory-server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { spawn } from "node:child_process";

const mongo = await MongoMemoryServer.create();
const uri = mongo.getUri();
console.log("Mongo memory server URI:", uri);

const client = new MongoClient(uri);
await client.connect();
const db = client.db("soil_superadmin_theme_test");
const passwordHash = await bcrypt.hash("supersecret123", 10);
await db.collection("superAdmins").insertOne({
  name: "Test Super Admin",
  email: "super@themetest.local",
  passwordHash,
  createdAt: new Date(),
});
await client.close();
console.log("Seeded super admin: super@themetest.local / supersecret123");

const proc = spawn("npx", ["next", "dev"], {
  cwd: "D:\\Soils Projects\\NVTTC management\\web",
  env: {
    ...process.env,
    MONGODB_URI: uri,
    MONGODB_DB: "soil_superadmin_theme_test",
    JWT_SECRET: "test-secret",
  },
  shell: true,
});

let ready = false;
proc.stdout.on("data", (d) => {
  const s = d.toString();
  process.stdout.write(s);
  if (s.includes("Ready in")) ready = true;
});
proc.stderr.on("data", (d) => process.stderr.write(d.toString()));

const start = Date.now();
while (!ready && Date.now() - start < 30000) {
  await new Promise((r) => setTimeout(r, 300));
}
await new Promise((r) => setTimeout(r, 1000));

console.log("READY_FOR_TESTING");
await new Promise(() => {});
