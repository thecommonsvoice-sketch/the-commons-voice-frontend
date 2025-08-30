import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import type { Article, Category } from "@/lib/types";

async function getCategoryWithArticles(slug: string): Promise<{ category: Category; articles: Article[] } | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const [categoryRes, articlesRes] = await Promise.all([
      fetch(`${base}/categories/${slug}`, { cache: "no-store" }),
      fetch(`${base}/articles?category=${slug}&limit=20`, { cache: "no-store" })
    ]);
    
    if (!categoryRes.ok) return null;
    
    const categoryData = await categoryRes.json();
    const articlesData = articlesRes.ok ? await articlesRes.json() : { articles: [] };
    
    return {
      category: categoryData?.category,
      articles: Array.isArray(articlesData?.articles) ? articlesData.articles : []
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getCategoryWithArticles(params.slug);
  if (!data) return { title: "Category Not Found" };
  
  const { category } = data;
  const title = `${category.name} News`;
  const description = category.description || `Latest ${category.name.toLowerCase()} news and analysis from The Common Voice`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

const validCategories = ["world", "politics", "business"];

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  if (!validCategories.includes(params.slug)) {
    notFound();
  }

  const data = await getCategoryWithArticles(params.slug);
  
  if (!data) {
    notFound();
  }

  const { category, articles } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-muted-foreground">{category.description}</p>
        )}
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found in this category.</p>
        </div>
      )}
    </div>
  );
}