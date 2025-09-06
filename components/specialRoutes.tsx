"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import type { Role } from "@/lib/types";

export default function SpecialRoutes({
  children,
  allowedRoles = ["ADMIN","EDITOR","REPORTER"] as Role[],
}: { children: ReactNode; allowedRoles?: Role[]; }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
      if (!user) {
        router.replace("/login"); setChecking(false); return;
      }
      if (!allowedRoles.includes(user.role)) {
        router.replace("/unauthorized"); setChecking(false); return;
    }
    setChecking(false);
  }, [pathname, router, user, allowedRoles]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return <>{children}</>;
}