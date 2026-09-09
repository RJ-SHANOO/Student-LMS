import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "node:child_process";

const mongo = await MongoMemoryServer.create();
const uri = mongo.getUri();
console.log("Mongo memory server URI:", uri);

const proc = spawn("npx", ["next", "dev"], {
  cwd: "D:\\Soils Projects\\NVTTC management\\web",
  env: {
    ...process.env,
    MONGODB_URI: uri,
    MONGODB_DB: "soil_test",
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

const base = "http://localhost:3000";

async function call(path, body, token, method = "POST") {
  const res = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

const reg = await call("/api/auth/register", {
  instituteName: "National Vocational & Technical Training Commission",
  ownerName: "Umair Ghafoor",
  email: "admin@nvttc.test",
  phone: "03001234567",
  password: "supersecret123",
});
console.log("register:", reg.status);
const adminToken = reg.json.token;

const student = await call(
  "/api/students",
  { name: "Ayesha Khan", cnic: "3520212345671", dob: "2002-05-14", department: "DM", course: "NAV", batch: "A" },
  adminToken
);
console.log("create student:", student.status);

await call(
  "/api/employees",
  { name: "Sara Malik", cnic: "3520212349999", dob: "1990-08-20", department: "Admin", designation: "Registrar" },
  adminToken
);
console.log("create employee");

await call("/api/settings", { officeLat: 31.5204, officeLng: 74.3587, officeRadius: 200 }, adminToken, "PATCH");
console.log("settings configured");

const fee = await call("/api/fees", { studentId: student.json.id, totalFee: 10000, dueDate: "2026-12-01" }, adminToken);
await call("/api/fees/" + fee.json.id, { amount: 4000 }, adminToken, "PATCH");
console.log("fee + partial payment created");

await call("/api/tasks", { assignedTo: student.json.id, title: "Read chapter 1" }, adminToken);
console.log("task assigned");

console.log("READY_FOR_TESTING");
console.log("Admin: admin@nvttc.test / supersecret123");
await new Promise(() => {});
