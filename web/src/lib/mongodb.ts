import dns from "node:dns";
import { MongoClient } from "mongodb";

// Some local dev machines report a broken resolver (127.0.0.1 with nothing
// listening), which breaks mongodb+srv:// DNS lookups even though the OS
// resolver works fine. Fall back to a public resolver in that case.
if (dns.getServers().every((server) => server === "127.0.0.1" || server === "::1")) {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Reuse the client across hot reloads in dev so we don't exhaust connections.
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB || "soil");
}
