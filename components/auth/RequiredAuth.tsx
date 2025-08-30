"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

type Role = "ADMIN" | "EDITOR" | "REPORTER" | "USER";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export default function RequireAuth({
  children,
  allowedRoles = ["ADMIN", "EDITOR", "REPORTER", "USER"] as Role[],
}: {
  children: ReactNode;
  allowedRoles?: Role[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Skip auth checks for public pages
    if (PUBLIC_ROUTES.includes(pathname)) {
      setChecking(false);
      return;
    }

    // Dashboard routes
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

    setChecking(false);
  }, [pathname, router, user, allowedRoles]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-lg text-gray-600">Loading…</span>
      </div>
    );
  }

  return <>{children}</>;
}
