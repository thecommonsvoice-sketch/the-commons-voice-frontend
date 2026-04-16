// src/components/ProtectedRoute.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";

export default function ProtectedRoute({
  children,
  allowedRoles = ["ADMIN", "EDITOR", "REPORTER"], // USER not included here
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) {
  const router = useRouter();
  const { user } = useUserStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Wait until user store has been hydrated (null means guest, not unknown)
    if (user === undefined) return; // if you change initial state to `undefined`
    
    if (!user) {
      // Guest (no login) → allowed to browse unless it's dashboard
      // If dashboard route, redirect
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")) {
        router.push("/login");
      }
      setChecking(false);
      return;
    }

    // Logged in but only USER → treat as guest
    if (user.role === "USER" && window.location.pathname.startsWith("/dashboard")) {
      router.push("/login");
      setChecking(false);
      return;
    }

    // Logged in with role not allowed
    if (!allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      setChecking(false);
      return;
    }

    setChecking(false);
  }, [user, router, allowedRoles]);

  if (checking) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
