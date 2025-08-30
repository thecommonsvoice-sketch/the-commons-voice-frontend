// src/providers/AuthProvider.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useUserStore } from "@/store/useUserStore";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, clearUser } = useUserStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      console.log("Hydrating auth...");
      try {
        const { data } = await api.get("/auth/me");
        console.log("Auth me success:", data);
        if (!cancelled) setUser(data.user);
      } catch {
        console.log("Access token failed, trying refresh...");
        try {
          await api.post("/auth/refresh");
          const { data } = await api.get("/auth/me");
          console.log("Refresh success:", data);
          if (!cancelled) setUser(data.user);
        } catch {
          console.log("Refresh failed, clearing user");
          if (!cancelled) clearUser();
        }
      } finally {
        if (!cancelled) {
          setReady(true);
          console.log("Auth ready");
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [setUser, clearUser]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-lg text-gray-600">Loading...</span>
      </div>
    );
  }

  return <>{children}</>;
}
