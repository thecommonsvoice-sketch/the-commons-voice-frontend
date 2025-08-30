import { Suspense } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import type { Article } from "@/lib/types";

async function getArticles(): Promise<Article[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/articles?limit=24`, { 
      cache: "no-store",
      next: { revalidate: 300 } 
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i}>
          <Skeleton className="h-48" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function ArticlesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Articles</h1>
        <p className="text-muted-foreground">Browse our latest news and analysis</p>
      </div>
      
      <Suspense fallback={<ArticlesSkeleton />}>
        <ArticlesList />
      </Suspense>
    </div>
  );
}

async function ArticlesList() {
  const articles = await getArticles();
  
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No articles found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}