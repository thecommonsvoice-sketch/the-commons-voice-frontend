import { create } from "zustand";
import type { User } from "@/lib/types";

interface UserStore {
  user: User | null;
  hydrated: boolean;
  setUser: (u: User | null) => void;
  clearUser: () => void;
  setHydrated: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setHydrated: () => set({ hydrated: true }),
}));