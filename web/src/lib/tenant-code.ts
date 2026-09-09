import type { Collection } from "mongodb";
import type { Tenant } from "@/types/models";

// Derives a short uppercase code from the institute name, e.g.
// "National Vocational & Technical Training Commission" -> "NVTTC".
// Falls back to the first letters of a single word, and disambiguates
// collisions with a numeric suffix.
export async function generateTenantCode(tenants: Collection<Tenant>, instituteName: string) {
  const words = instituteName
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  let base: string;
  if (words.length >= 2) {
    base = words.map((w) => w[0]).join("").toUpperCase();
  } else {
    base = (words[0] ?? "TENANT").slice(0, 5).toUpperCase();
  }
  if (base.length < 2) {
    base = base.padEnd(3, "X");
  }

  let candidate = base;
  let suffix = 1;
  while (await tenants.findOne({ code: candidate })) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }
  return candidate;
}
