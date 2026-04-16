import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useUserStore } from "@/store/useUserStore";

export function redirectByRole(router: AppRouterInstance) {
  const user = useUserStore.getState().user;
  if (!user) return;
  switch (user.role) {
    case "ADMIN":    router.replace("/dashboard/admin"); break;
    case "EDITOR":   router.replace("/dashboard/editor"); break;
    case "REPORTER": router.replace("/dashboard/reporter"); break;
    default:         router.replace("/dashboard"); break;
  }
}