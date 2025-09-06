import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/loading-skeleton";
import type { Article, Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";
import { BreakingNewsTicker } from "@/components/BreakingNewsTicker";
import { RecommendedWidget } from "@/components/RecommendedWidget";
import { LeftPortalNav } from "@/components/LeftPortalNav";

async function getArticles(): Promise<Article[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/articles?limit=20`, { 
      next: { revalidate: 300 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/categories`, { 
      next: { revalidate: 600 }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.categories) ? data.categories : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [articles, categories] = await Promise.all([
    getArticles(),
    getCategories()
  ]);

  // Only show published articles
  const publishedArticles = articles.filter(a => a.status === "PUBLISHED");
  const featuredArticles = publishedArticles.slice(0, 5);
  const recentArticles = publishedArticles.slice(5, 17);
  const trendingCategories = categories.filter(c => c.isActive).slice(0, 6);

  const recommendedItems = publishedArticles.slice(0, 5).map(article => ({
    title: article.title,
    link: `/articles/${article.slug}`,
    image: article.coverImage ?? "/placeholder.jpg"
  }));

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <AdSlot slot="leaderboard" width={970} height={250} className="mx-auto mb-6" />

      {featuredArticles.length > 0 && (
        <BreakingNewsTicker headlines={featuredArticles.map(a => a.title)} />
      )}

      {featuredArticles.length > 0 && (
        <HeroCarousel articles={featuredArticles} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-6">
        {/* Left Sidebar */}
        <div >
          <LeftPortalNav />
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold border-b-2 border-primary pb-2">
                Latest News
              </h2>
              <Link href="/articles" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recentArticles.length > 0 ? (
                recentArticles.map((article, index) => (
                  <div key={article.id}>
                    {index > 0 && index % 4 === 0 && (
                      <AdSlot
                        slot={`inline-${index}`}
                        width={300}
                        height={250}
                        className="my-4"
                      />
                    )}
                    <ArticleCard article={article} />
                  </div>
                ))
              ) : (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-48" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trending Topics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {trendingCategories.map(category => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="block"
                >
                  <Badge
                    variant="outline"
                    className="w-full justify-start dark:hover:text-black hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <AdSlot slot="sidebar-top" width={300} height={600} />
          <RecommendedWidget items={recommendedItems} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stay Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest news delivered to your inbox.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 text-sm border rounded-md"
                />
                <button className="w-full bg-primary text-primary-foreground px-3 py-2 text-sm rounded-md hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
