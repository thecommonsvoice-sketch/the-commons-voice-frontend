export type Role = "ADMIN" | "EDITOR" | "REPORTER" | "USER";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  isActive: boolean; // <-- Added for type safety
  createdAt?: string;
  updatedAt?: string; // <-- Added for consistency with backend
}

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoData {
  type: "upload" | "embed";
  url: string;
  title?: string;
  description?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  coverImage?: string | null;
  ogImage?: string | null;
  categoryId: string;
  authorId: string;
  status: ArticleStatus;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  author?: Pick<User, "id" | "name">;
  category?: Pick<Category, "id" | "name" | "slug">;
  videos?: VideoData[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}