"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

type Role = "ADMIN" | "EDITOR" | "REPORTER" | "USER";

function isPublicPath(path: string): boolean {
  const publicPaths = ["/", "/login", "/signup", "/about", "/contact"];
  return (
    publicPaths.includes(path) ||
    path.startsWith("/articles") ||
    path.startsWith("/categories")
  );
}

export default function RequireAuth({
  children,
  allowedRoles = ["ADMIN", "EDITOR", "REPORTER", "USER"] as Role[],
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const user = useUserStore((state) => state.user);
  const hydrated = useUserStore((state) => state.hydrated);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // If it's a public path, allow immediately
    if (isPublicPath(pathname)) {
      setAuthorized(true);
      return;
    }

    // Wait for auth hydration to complete before making decisions
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
