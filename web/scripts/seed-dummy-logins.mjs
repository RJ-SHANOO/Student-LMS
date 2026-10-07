// Seeds one complete, idempotent set of dummy login credentials for manual/E2E
// testing of every role: super admin, tenant admin, employee, student.
//
// Safe to re-run: it upserts by the unique fields (email/cnic/code) each role
// actually logs in with, so running it twice won't create duplicates or fail
// on unique-index conflicts.
//
// Usage:
//   node scripts/seed-dummy-logins.mjs
//
// Reads MONGODB_URI / MONGODB_DB from .env.local (same file Next.js uses).

import { readFileSync } from "node:fs";
import dns from "node:dns";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

// Some local dev shells report a broken resolver (127.0.0.1 with nothing
// listening), which breaks mongodb+srv:// DNS lookups even though the OS
// resolver works fine. Fall back to a public resolver in that case.
if (dns.getServers().every((s) => s === "127.0.0.1" || s === "::1")) {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

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

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set (checked .env.local and the environment).");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB || "soil");

const tenants = db.collection("tenants");
const users = db.collection("users");
const settings = db.collection("settings");
const counters = db.collection("counters");
const superAdmins = db.collection("superAdmins");

await Promise.all([
  tenants.createIndex({ ownerEmail: 1 }, { unique: true }),
  tenants.createIndex({ code: 1 }, { unique: true }),
  users.createIndex({ email: 1 }, { unique: true, sparse: true }),
  users.createIndex({ cnic: 1 }, { unique: true, sparse: true }),
  users.createIndex({ tenantId: 1 }),
  settings.createIndex({ tenantId: 1 }, { unique: true }),
  superAdmins.createIndex({ email: 1 }, { unique: true }),
]);

const PASSWORD = "Test@1234";
const hash = (pw) => bcrypt.hash(pw, 10);

// ---- Super Admin -----------------------------------------------------------

const superAdminEmail = "superadmin@soil.test";
await superAdmins.updateOne(
  { email: superAdminEmail },
  {
    $setOnInsert: { createdAt: new Date() },
    $set: { name: "SOIL Platform Owner", passwordHash: await hash(PASSWORD) },
  },
  { upsert: true }
);

// ---- Tenant + Admin ---------------------------------------------------------

const tenantCode = "NVTTC";
const ownerEmail = "admin@nvttc.test";
let tenant = await tenants.findOne({ code: tenantCode });
if (!tenant) {
  const result = await tenants.insertOne({
    name: "National Vocational & Technical Training Commission",
    code: tenantCode,
    ownerName: "Umair Ghafoor",
    ownerEmail,
    ownerPhone: "03001234567",
    createdAt: new Date(),
    status: "active",
  });
  tenant = { _id: result.insertedId };
} else {
  await tenants.updateOne({ _id: tenant._id }, { $set: { status: "active" } });
}
const tenantId = tenant._id;

await users.updateOne(
  { email: ownerEmail },
  {
    $setOnInsert: { tenantId, role: "admin", createdAt: new Date() },
    $set: {
      name: "Umair Ghafoor",
      phone: "03001234567",
      passwordHash: await hash(PASSWORD),
      status: "active",
    },
  },
  { upsert: true }
);

await settings.updateOne(
  { tenantId },
  {
    $setOnInsert: { tenantId },
    $set: {
      instituteName: "National Vocational & Technical Training Commission",
      officeLat: 31.5204,
      officeLng: 74.3587,
      officeRadius: 200,
      lateAfterTime: "09:15",
      themePreference: "light",
    },
  },
  { upsert: true }
);

// ---- Employees (CNIC + DOB login) -------------------------------------------

const employeeDefs = [
  {
    cnic: "3520211111111",
    dob: "1990-03-15",
    name: "Sara Malik",
    department: "Admin",
    designation: "Registrar",
    coursesTaught: [],
  },
  {
    cnic: "3520211111112",
    dob: "1988-07-22",
    name: "Bilal Ahmed",
    department: "IT",
    designation: "Instructor",
    coursesTaught: ["NAV", "WD"],
  },
];

for (const emp of employeeDefs) {
  await users.updateOne(
    { cnic: emp.cnic },
    {
      $setOnInsert: { tenantId, role: "employee", createdAt: new Date() },
      $set: {
        name: emp.name,
        dob: emp.dob,
        department: emp.department,
        designation: emp.designation,
        coursesTaught: emp.coursesTaught,
        status: "active",
      },
    },
    { upsert: true }
  );
}

// ---- Students (CNIC + DOB login) --------------------------------------------

async function nextStudentSeq(year) {
  const key = `student:${tenantId.toString()}:${year}`;
  const result = await counters.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return result.seq;
}

const studentDefs = [
  { cnic: "3520212222221", dob: "2002-05-14", name: "Ayesha Khan", department: "DM", course: "NAV", batch: "A" },
  { cnic: "3520212222222", dob: "2003-01-09", name: "Hamza Tariq", department: "IT", course: "WD", batch: "B" },
  { cnic: "3520212222223", dob: "2001-11-30", name: "Fatima Noor", department: "DM", course: "NAV", batch: "A" },
];

const year = new Date().getFullYear();
for (const stu of studentDefs) {
  const existing = await users.findOne({ cnic: stu.cnic });
  if (existing) {
    await users.updateOne(
      { cnic: stu.cnic },
      { $set: { name: stu.name, dob: stu.dob, department: stu.department, course: stu.course, batch: stu.batch, status: "active" } }
    );
    continue;
  }
  const seq = await nextStudentSeq(year);
  const uniqueId = `${tenantCode}-${stu.department}-${stu.course}-${stu.batch}-${year}-${seq.toString().padStart(3, "0")}`;
  await users.insertOne({
    tenantId,
    name: stu.name,
    cnic: stu.cnic,
    dob: stu.dob,
    role: "student",
    department: stu.department,
    course: stu.course,
    batch: stu.batch,
    status: "active",
    uniqueId,
    createdAt: new Date(),
  });
}

await client.close();

// ---- Report ------------------------------------------------------------------

console.log("\nDummy login credentials seeded (all passwords: " + PASSWORD + ")\n");
console.log("SUPER ADMIN  (email + password) -> /login or /superadmin");
console.log(`  email:    ${superAdminEmail}`);
console.log(`  password: ${PASSWORD}\n`);

console.log("TENANT ADMIN (email + password)");
console.log(`  institute: NVTTC (tenant code ${tenantCode})`);
console.log(`  email:     ${ownerEmail}`);
console.log(`  password:  ${PASSWORD}\n`);

console.log("EMPLOYEES (CNIC + DOB)");
for (const e of employeeDefs) {
  console.log(`  ${e.name.padEnd(14)} cnic: ${e.cnic}   dob: ${e.dob}`);
}
console.log();

console.log("STUDENTS (CNIC + DOB)");
for (const s of studentDefs) {
  console.log(`  ${s.name.padEnd(14)} cnic: ${s.cnic}   dob: ${s.dob}   (${s.department}-${s.course}-${s.batch})`);
}
console.log();
