import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";
import type { Article, Category } from "@/lib/types";

// ISR Configuration
export const revalidate = 120; // Revalidate every 2 minutes (categories change less frequently)
export const dynamic = 'force-static';
export const dynamicParams = true;

// --- Generate Static Params for ISR ---
export async function generateStaticParams() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  try {
    const res = await fetch(`${base}/categories/all-with-hierarchy`, {
      cache: 'no-store'
    });

    if (!res.ok) return [];

    const data = await res.json();
    const categories = Array.isArray(data) ? data : (data?.categories || []);

    return categories.map((cat: any) => ({
      slug: cat.slug,
    }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}

async function getCategoryWithArticles(
  slug: string,
  page: number
): Promise<{
  category: Category;
  articles: Article[];
  pagination: { total: number; totalPages: number };
} | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const [categoryRes, articlesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`, {
        next: { revalidate: 120 },  // Cache with ISR
        headers: { Cookie: cookieHeader }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles?category=${slug}&page=${page}&limit=9`, {
        next: { revalidate: 120 },  // Cache with ISR
        headers: { Cookie: cookieHeader }
      }),
    ]);

    if (!categoryRes.ok || !articlesRes.ok) throw new Error("Failed to fetch data");

    const categoryData = await categoryRes.json();
    const articlesData = await articlesRes.json();

    return {
      category: categoryData.category,
      articles: articlesData.data,
      pagination: articlesData.pagination,
    };
  } catch (error) {
    console.error("Error in getCategoryWithArticles:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryWithArticles(slug, 1);
  if (!data) return { title: "Category Not Found" };

  const { category } = data;
  const title = `${category.name} - Latest News & Updates`;
  const description = category.description || `Stay updated with the latest ${category.name.toLowerCase()} news from The Commons Voice`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${slug}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCategoryWithArticles(slug, 1);

  if (!data) notFound();

  const { category, articles, pagination } = data;

  return (
    <CategoryClient
      category={category}
      initialArticles={articles}
      initialPagination={pagination}
    />
  );
}
