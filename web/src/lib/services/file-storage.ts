import { del, put } from "@vercel/blob";
import { AuthError } from "@/lib/auth";

export const MAX_TASK_FILE_BYTES = 5 * 1024 * 1024; // 5MB, per CLAUDE.md's Tasks module

export const ALLOWED_TASK_FILE_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "text/plain",
  "application/zip",
]);

function assertValidTaskFile(file: File) {
  if (file.size === 0) {
    throw new AuthError("File is empty", 400);
  }
  if (file.size > MAX_TASK_FILE_BYTES) {
    throw new AuthError("File is too large — max 5MB", 400);
  }
  if (file.type && !ALLOWED_TASK_FILE_TYPES.has(file.type)) {
    throw new AuthError("That file type isn't allowed", 400);
  }
}

// Vercel Blob's free tier only serves files at `access: "public"` URLs — there
// is no built-in private/signed-URL mode. The path below gets a random suffix
// from Blob itself, so the URL isn't guessable, and every page in this app
// only ever renders that URL to the student who submitted it or the employee
// who owns the task — but anyone who obtains the exact URL directly (e.g. a
// leaked link) could still fetch the file. Acceptable for this MVP's $0-cost
// constraint; note this if task files ever need to be more sensitive.
export async function uploadTaskFile(pathPrefix: string, file: File) {
  assertValidTaskFile(file);
  const blob = await put(`${pathPrefix}/${file.name}`, file, { access: "public" });
  return { url: blob.url, fileName: file.name };
}

export async function deleteTaskFile(url: string) {
  try {
    await del(url);
  } catch {
    // Best-effort cleanup — a dangling blob costs a few KB and isn't worth failing the request over.
  }
}
