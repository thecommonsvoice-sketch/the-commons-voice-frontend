"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import type { Role } from "@/lib/types";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/about", "/contact"];

function isPublicPath(path: string): boolean {
  return (
    PUBLIC_PATHS.includes(path) ||
    path.startsWith("/articles") ||
    path.startsWith("/categories")
  );
}

export default function RequireAuth({
  children,
  allowedRoles = ["ADMIN", "EDITOR", "REPORTER"] as Role[],
}: { children: ReactNode; allowedRoles?: Role[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hydrated } = useUserStore();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Public paths are always allowed immediately
    if (isPublicPath(pathname)) {
      setAuthorized(true);
      return;
    }

    // Wait for auth hydration before making any redirect decisions
    if (!hydrated) return;

    // Dashboard route protection
    if (pathname.startsWith("/dashboard")) {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (!allowedRoles.includes(user.role)) {
        router.replace("/unauthorized");
        return;
      }
    }

    setAuthorized(true);
  }, [pathname, router, user, allowedRoles, hydrated]);

  // Show loading only for protected routes while waiting for hydration
  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}