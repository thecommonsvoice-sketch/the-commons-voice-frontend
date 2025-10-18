import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryClient from "./CategoryClient";
import type { Article, Category } from "@/lib/types";

async function getCategoryWithArticles(
  slug: string,
  page: number
): Promise<{
  category: Category;
  articles: Article[];
  pagination: { total: number; totalPages: number };
} | null> {
  try {
    const [categoryRes, articlesRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`, { cache: "no-store" }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles?category=${slug}&page=${page}&limit=9`, { cache: "no-store" }),
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
