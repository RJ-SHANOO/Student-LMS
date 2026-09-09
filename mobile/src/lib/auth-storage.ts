import * as SecureStore from "expo-secure-store";
import type { Session } from "./session-context";

const STORAGE_KEY = "soil_session";

// SecureStore has no web implementation (it's a no-op stub there), and any
// keychain/keystore access can fail on-device too — never let a storage
// failure hang app startup or crash a login/logout action.
export async function saveSession(session: Session) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Best-effort persistence: the session still works for this app run.
  }
}

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
  } catch {
    // Nothing to clean up if the platform never persisted it.
  }
}
