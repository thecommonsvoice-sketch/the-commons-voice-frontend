import { create } from "zustand";

type Category = { name: string; href: string };

interface CategoryState {
  categories: Category[];
  hasFetched: boolean;
  setCategories: (categories: Category[]) => void;
  markFetched: () => void;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  hasFetched: false,
  setCategories: (categories) => set({ categories, hasFetched: true }),
  markFetched: () => set({ hasFetched: true }),
}));
