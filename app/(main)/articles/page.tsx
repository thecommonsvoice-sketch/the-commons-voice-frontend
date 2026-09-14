import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { ScrollReveal } from "@/components/ScrollReveal";
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
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Editorial Header Banner with Background Image & Gradient */}
      <header className="relative rounded-3xl p-6 sm:p-10 md:p-12 overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-950 text-white shadow-xl group">
        {/* Background Wallpaper Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1600&q=80"
            alt="Newsroom Dispatch"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/80" />
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/25 blur-3xl rounded-full pointer-events-none" />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                The Commons Voice Archive
              </div>
              <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight text-white drop-shadow-md">
                Explore All Articles
              </h1>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
                Browse breaking news, investigative journalism, in-depth reports, and expert analysis across every channel.
              </p>
            </div>

            {/* Search Bar */}
            <div className="shrink-0 w-full md:w-80">
              <SearchBar placeholder="Search news and topics…" defaultValue={search} />
            </div>
          </div>

          {/* Category Filter Pills */}
          <Suspense fallback={null}>
            <CategoryFilters activeCategory={categorySlug} search={search} />
          </Suspense>
        </div>
      </header>

      {/* Active Filter Indicator */}
      {(search || categorySlug) && (
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-card p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="font-semibold">Filtered results:</span>
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
              &quot;{search}&quot;
              <Link href={`/articles?page=1${categorySlug ? `&category=${categorySlug}` : ""}`} className="ml-1 hover:opacity-80">✕</Link>
            </span>
          )}
          {categorySlug && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-xs font-bold capitalize">
              {categorySlug.replace(/-/g, " ")}
              <Link href={`/articles?page=1${search ? `&q=${encodeURIComponent(search)}` : ""}`} className="ml-1 hover:opacity-80">✕</Link>
            </span>
          )}
          <Link href="/articles" className="text-xs font-semibold text-primary hover:underline ml-auto">
            Clear Filters
          </Link>
        </div>
      )}

      {/* Articles Grid */}
      <ScrollReveal direction="up" delay={0.1}>
        <Suspense fallback={<ArticlesSkeleton />}>
          <ArticlesList page={page} search={search} category={categorySlug} />
        </Suspense>
      </ScrollReveal>
    </div>
  );
}

async function CategoryFilters({ activeCategory, search }: { activeCategory: string; search: string }) {
  const categories = await getCategories();
  const activeCategories = categories.filter(c => c.isActive);

  if (activeCategories.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2">
      <Link
        href={`/articles?page=1${search ? `&q=${encodeURIComponent(search)}` : ""}`}
        className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap backdrop-blur-md shadow-xs
          ${!activeCategory
            ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
            : "bg-white/10 text-slate-100 border-white/20 hover:bg-white/20 hover:text-white"
          }`}
      >
        All Topics
      </Link>
      {activeCategories.map((cat) => (
        <Link
          key={cat.id}
          href={`/articles?page=1&category=${cat.slug}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
          className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap backdrop-blur-md shadow-xs
            ${activeCategory === cat.slug
              ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
              : "bg-white/10 text-slate-100 border-white/20 hover:bg-white/20 hover:text-white"
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
