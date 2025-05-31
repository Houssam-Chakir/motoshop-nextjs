"use client";

import { createContext, useContext } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

interface SessionContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  status: "loading",
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  return <SessionContext.Provider value={{ session, status }}>{children}</SessionContext.Provider>;
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
