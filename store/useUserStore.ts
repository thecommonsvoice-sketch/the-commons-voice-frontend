import { create } from "zustand";
import type { User } from "@/lib/types";

interface UserStore {
  user: User | null;
  setUser: (u: User | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));