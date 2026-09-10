import { createContext, useContext, useState, type ReactNode } from "react";

export interface Session {
  token: string;
  userId: string;
  name: string;
  role: "employee" | "student";
  uniqueId?: string;
  // Employees only — course codes they teach, and so can assign tasks to.
  coursesTaught?: string[];
}

interface SessionContextValue {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  return <SessionContext.Provider value={{ session, setSession }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
