// src/providers/AuthProvider.tsx
"use client";

import { ReactNode, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/useUserStore";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, clearUser, setHydrated } = useUserStore();
  const hydrating = useRef(false);

  useEffect(() => {
    if (hydrating.current) return;
    hydrating.current = true;

    async function hydrate() {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        try {
          const { data } = await api.get("/auth/me");
          setUser(data.user);
        } catch {
          clearUser();
        }
      } finally {
        setHydrated();
      }
    }

    hydrate();
  }, [setUser, clearUser, setHydrated]);

  /* 
     Content renders immediately for SEO.
     Guard components (RequireAuth, SpecialRoutes) wait for 
     store.hydrated before making redirect decisions.
  */
  
  return <>{children}</>;
}

