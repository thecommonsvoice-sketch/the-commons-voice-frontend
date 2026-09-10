import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import type { Article, Category } from "@/lib/types";

// --- SEO Metadata ---
export const metadata: Metadata = {
  title: "All Articles – The Commons Voice",
  description: "Browse the latest news, insights, and in-depth analysis across trending topics.",
  openGraph: {
    title: "All Articles – The Commons Voice",
    description: "Stay informed with our curated collection of articles across categories.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles`,
    siteName: "The Commons Voice",
    type: "website",
  },
  alternates: {
    canonical: "/articles",
  },
};

async function getArticles(page: number, search = "", category = ""): Promise<{
  articles: Article[];
  pagination: { total: number; totalPages: number };
}> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    let url = `${base}/articles?page=${page}&limit=12&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: { Cookie: cookieHeader },
    });

    if (!res.ok) return { articles: [], pagination: { total: 0, totalPages: 1 } };
    const data = await res.json();

    const list: Article[] = Array.isArray(data?.data) ? data.data : [];
    return {
      articles: list.filter((a) => !a.isSubscriberOnly),
      pagination: data.pagination ?? { total: 0, totalPages: 1 },
    };
  } catch {
    return { articles: [], pagination: { total: 0, totalPages: 1 } };
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/categories`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.categories) ? data.categories : [];
  } catch {
    return [];
  }
}

function ArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-xl shadow-sm">
          <Skeleton className="h-48 w-full" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const search = params.q || "";
  const categorySlug = params.category || "";

  return (
    <div className="container mx-auto px-4 sm:px-6 pt-2 pb-8 sm:pt-4 sm:pb-12 space-y-6">
      {/* Editorial Header */}
      <header className="border-b border-border pb-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-1">
              Browse & Discover
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-foreground">
              All Articles
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
              Stay updated with breaking news, trending stories, and in-depth analysis from our newsroom.
            </p>
          </div>

          {/* Search Bar - aligned right on desktop */}
          <div className="shrink-0 w-full sm:w-auto">
            <SearchBar placeholder="Search articles…" defaultValue={search} />
          </div>
        </div>

        {/* Category Filter Pills */}
        <Suspense fallback={null}>
          <CategoryFilters activeCategory={categorySlug} search={search} />
        </Suspense>
      </header>

      {/* Active Filter Indicator */}
      {(search || categorySlug) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing results</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              &quot;{search}&quot;
              <Link href={`/articles?page=1${categorySlug ? `&category=${categorySlug}` : ""}`} className="ml-0.5 hover:text-primary/70">×</Link>
            </span>
          )}
          {categorySlug && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
              {categorySlug.replace(/-/g, " ")}
              <Link href={`/articles?page=1${search ? `&q=${encodeURIComponent(search)}` : ""}`} className="ml-0.5 hover:text-primary/70">×</Link>
            </span>
          )}
          <Link href="/articles" className="text-xs text-muted-foreground hover:text-primary underline ml-1">
            Clear all
          </Link>
        </div>
      )}

      {/* Articles Grid */}
      <Suspense fallback={<ArticlesSkeleton />}>
        <ArticlesList page={page} search={search} category={categorySlug} />
      </Suspense>
    </div>
  );
}

async function CategoryFilters({ activeCategory, search }: { activeCategory: string; search: string }) {
  const categories = await getCategories();
  const activeCategories = categories.filter(c => c.isActive);

  if (activeCategories.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
      <Link
        href={`/articles?page=1${search ? `&q=${encodeURIComponent(search)}` : ""}`}
        className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap
          ${!activeCategory
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
          }`}
      >
        All Topics
      </Link>
      {activeCategories.map((cat) => (
        <Link
          key={cat.id}
          href={`/articles?page=1&category=${cat.slug}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border whitespace-nowrap
            ${activeCategory === cat.slug
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}

async function ArticlesList({ page, search, category }: { page: number; search: string; category: string }) {
  const { articles, pagination } = await getArticles(page, search, category);

  if (articles.length === 0) {
    return (
      <div className="text-center py-16 rounded-xl border-2 border-dashed border-border bg-muted/20">
        <p className="text-lg font-medium text-foreground mb-1">No articles found</p>
        <p className="text-sm text-muted-foreground mb-4">
          {search || category ? "Try adjusting your search or filters." : "No articles published yet."}
        </p>
        {(search || category) && (
          <Link href="/articles" className="text-sm text-primary hover:underline font-medium">
            ← View all articles
          </Link>
        )}
      </div>
    );
  }

  // First article gets featured treatment on page 1 when not searching
  const showFeatured = page === 1 && !search && !category && articles.length > 2;
  const featuredArticle = showFeatured ? articles[0] : null;
  const gridArticles = showFeatured ? articles.slice(1) : articles;

  return (
    <>
      {/* Featured Lead Article (page 1 only) */}
      {featuredArticle && (
        <div className="mb-8">
          <ArticleCard article={featuredArticle} variant="featured" />
        </div>
      )}

      {/* Articles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {gridArticles.map((article) => (
          <div key={article.id}>
            <ArticleCard article={article} variant="default" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        basePath="/articles"
        searchQuery={search || undefined}
        extraParams={category ? { category } : undefined}
      />
    </>
  );
}
