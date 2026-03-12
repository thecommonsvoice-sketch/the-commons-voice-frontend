// src/providers/AuthProvider.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/useUserStore";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, clearUser } = useUserStore();
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
  }, [setUser, clearUser]);

  /* 
     REMOVED FULL-PAGE LOADING SPINNER FOR SEO:
     Next.js should render the content immediately. 
     The 'ready' state is still useful if you want to prevent 
     flickering in the Navbar, but it shouldn't block the whole page.
  */
  
  return <>{children}</>;
}
