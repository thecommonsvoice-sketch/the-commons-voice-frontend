// src/providers/AuthProvider.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/useUserStore";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, clearUser, user } = useUserStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // let cancelled = false;

    async function hydrate() {
      try {
        const { data } = await api.get("/auth/me");
        // if (!cancelled)
           setUser(data.user);
      } catch {
        try {
          // await api.post("/auth/refresh");
          const { data } = await api.get("/auth/me");
          // if (!cancelled)
             setUser(data.user);
        } catch {
          // if (!cancelled) 
            clearUser();
        }
      } finally {
        // if (!cancelled) 
          
          setReady(true);
        
      }
    }

    hydrate();
    // return () => {
    //   cancelled = true;
    // };
  }, [setUser, clearUser,user]);

  if (!ready) {
    return (
 <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
