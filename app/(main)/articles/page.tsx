import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { Article, Category } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Bookmark, ArrowRight, Filter, Search, RotateCcw } from "lucide-react";

// --- SEO Metadata ---
export const metadata: Metadata = {
  title: "The Dispatches Archive | The Commons Voice",
  description:
    "Comprehensive archive of investigative reporting, foreign correspondence, and verified public records from The Commons Voice.",
  openGraph: {
    title: "The Dispatches Archive – The Commons Voice",
    description:
      "Search and review our full public record of articles, analytical essays, and breaking wire dispatches.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/articles`,
    siteName: "The Commons Voice",
    type: "website",
  },
  alternates: {
    canonical: "/articles",
  },
};

export const revalidate = 60;

function optimizeImageUrl(url: string | undefined | null, width = 1200): string {
  if (!url) return "/placeholder.jpg";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

async function getArticles(
  page: number,
  search = "",
  category = ""
): Promise<{
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
      next: { revalidate: 60 },
      headers: { Cookie: cookieHeader },
    });

    if (!res.ok) return { articles: [], pagination: { total: 0, totalPages: 1 } };
    const data = await res.json();

    const list: Article[] = Array.isArray(data?.data) ? data.data : [];
    return {
      articles: list.filter((a) => !a.isSubscriberOnly),
      pagination: data.pagination ?? { total: 0, totalPages: 1 },
    };
  } catch (error) {
    console.error("Error in getArticles:", error);
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
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-[#E2D9CE] bg-[#FAF7F2] p-5 space-y-3">
          <Skeleton className="aspect-video w-full rounded-none bg-[#EAE2D8]" />
          <Skeleton className="h-5 w-3/4 rounded-none bg-[#EAE2D8]" />
          <Skeleton className="h-4 w-full rounded-none bg-[#EAE2D8]" />
          <Skeleton className="h-3 w-1/3 rounded-none bg-[#EAE2D8]" />
        </div>
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
    <div className="w-full bg-[#FAF7F2] text-[#1A1715] min-h-screen">
      <main className="max-w-[1380px] mx-auto px-3 sm:px-6 md:px-8 py-6 sm:py-8 space-y-8">
        {/* 1. BREADCRUMB & METADATA BAR */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[#E2D9CE] pb-3 text-xs font-sans text-[#68635D]">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#1A1715] transition-colors">
              Home
            </Link>
            <span className="text-[#D1C4B5]">/</span>
            <span className="font-bold text-[#1A1715] uppercase tracking-wider">
              Dispatches Archive
            </span>
          </div>
          <div className="text-[11px] font-sans text-[#68635D] hidden sm:block">
            The Commons Voice · Complete Public Register
          </div>
        </div>

        {/* 2. BROADSHEET MASTHEAD BANNER */}
        <header className="border-b-2 border-[#1A1715] pb-8 space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-block px-2.5 py-0.5 bg-[#1A1715] text-[#FAF7F2] font-sans text-[10px] font-extrabold uppercase tracking-widest">
              Public Register
            </span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
              Comprehensive Newsroom Index
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1715] tracking-tight leading-tight">
                The Dispatches Archive
              </h1>
              <p className="font-serif text-sm sm:text-base text-[#3C3835] leading-relaxed">
                Chronological index of field investigations, diplomatic cables, economic analyses,
                and cultural criticism filed across all reporting beats.
              </p>
            </div>

            {/* Quick Search Input */}
            <div className="shrink-0 w-full lg:w-96">
              <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#68635D] block mb-1.5">
                Query The Archives:
              </span>
              <SearchBar placeholder="Search headlines, beats, dossiers…" defaultValue={search} />
            </div>
          </div>
        </header>

        {/* 3. CATEGORY DOSSIER FILTER CONSOLE */}
        <section className="bg-[#F8F4EE] border border-[#DFD6C9] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-widest text-[#68635D]">
              <Filter className="w-3.5 h-3.5 text-[#C2410C]" />
              <span>Filter By Reporting Beat:</span>
            </div>
            <Link
              href="/categories"
              className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#C2410C] hover:text-[#1A1715] transition-colors"
            >
              Section Index →
            </Link>
          </div>

          <Suspense fallback={null}>
            <CategoryFilters activeCategory={categorySlug} search={search} />
          </Suspense>
        </section>

        {/* 4. ACTIVE FILTER INDICATOR BAR */}
        {(search || categorySlug) && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F2] p-3 sm:p-4 border border-[#1A1715] font-sans text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#1A1715] uppercase tracking-wider text-[11px]">
                Active Filter:
              </span>
              {search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1A1715] text-[#FAF7F2] text-[11px] font-medium">
                  <span>Query: &ldquo;{search}&rdquo;</span>
                  <Link
                    href={`/articles?page=1${categorySlug ? `&category=${categorySlug}` : ""}`}
                    className="hover:text-[#C2410C] transition-colors ml-1 font-bold"
                    title="Remove search query"
                  >
                    ✕
                  </Link>
                </span>
              )}
              {categorySlug && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C2410C] text-[#FAF7F2] text-[11px] font-bold uppercase tracking-wider">
                  <span>Beat: {categorySlug.replace(/-/g, " ")}</span>
                  <Link
                    href={`/articles?page=1${search ? `&q=${encodeURIComponent(search)}` : ""}`}
                    className="hover:text-[#1A1715] transition-colors ml-1 font-bold"
                    title="Remove category filter"
                  >
                    ✕
                  </Link>
                </span>
              )}
            </div>

            <Link
              href="/articles"
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#68635D] hover:text-[#1A1715] transition-colors ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All Filters</span>
            </Link>
          </div>
        )}

        {/* 5. ARTICLES ARCHIVE LIST */}
        <ScrollReveal direction="up" delay={0.05}>
          <Suspense fallback={<ArticlesSkeleton />}>
            <ArticlesList page={page} search={search} category={categorySlug} />
          </Suspense>
        </ScrollReveal>
      </main>
    </div>
  );
}

async function CategoryFilters({
  activeCategory,
  search,
}: {
  activeCategory: string;
  search: string;
}) {
  const categories = await getCategories();
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1 font-sans text-xs">
      <Link
        href={`/articles?page=1${search ? `&q=${encodeURIComponent(search)}` : ""}`}
        className={`shrink-0 px-3.5 py-1.5 uppercase tracking-wider font-bold text-[11px] transition-colors rounded-none border ${
          !activeCategory
            ? "bg-[#1A1715] text-[#FAF7F2] border-[#1A1715]"
            : "bg-[#FAF7F2] text-[#3C3835] border-[#E2D9CE] hover:border-[#1A1715] hover:bg-[#F3EDE5]"
        }`}
      >
        All Dossiers
      </Link>
      {activeCategories.map((cat) => {
        const isSelected = activeCategory.toLowerCase() === cat.slug.toLowerCase();
        return (
          <Link
            key={cat.id}
            href={`/articles?page=1&category=${cat.slug}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
            className={`shrink-0 px-3.5 py-1.5 uppercase tracking-wider font-semibold text-[11px] transition-colors rounded-none border ${
              isSelected
                ? "bg-[#1A1715] text-[#FAF7F2] border-[#1A1715] font-bold"
                : "bg-[#FAF7F2] text-[#3C3835] border-[#E2D9CE] hover:border-[#1A1715] hover:bg-[#F3EDE5]"
            }`}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}

async function ArticlesList({
  page,
  search,
  category,
}: {
  page: number;
  search: string;
  category: string;
}) {
  const { articles, pagination } = await getArticles(page, search, category);

  if (articles.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-[#F8F4EE] border border-[#DFD6C9] space-y-4">
        <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#C2410C] block">
          Archival Notice
        </span>
        <h3 className="font-headline text-2xl font-bold text-[#1A1715]">
          No Dispatches Recorded Under This Parameter
        </h3>
        <p className="font-serif text-sm text-[#3C3835] max-w-md mx-auto leading-relaxed">
          {search || category
            ? "No dispatches were located matching your active query or selected beat. Please broaden your terms or review our Section Index."
            : "There are currently no articles published in this archive."}
        </p>
        <div className="pt-2 flex items-center justify-center gap-4 font-sans text-xs">
          {(search || category) && (
            <Link
              href="/articles"
              className="px-4 py-2 bg-[#1A1715] text-[#FAF7F2] font-bold uppercase tracking-wider hover:bg-[#C2410C] transition-colors"
            >
              Reset Archive Filters
            </Link>
          )}
          <Link
            href="/categories"
            className="px-4 py-2 border border-[#1A1715] text-[#1A1715] font-bold uppercase tracking-wider hover:bg-[#EAE2D8] transition-colors"
          >
            Browse Section Index →
          </Link>
        </div>
      </div>
    );
  }

  // First article gets a prominent broadsheet lead showcase on page 1 with no filters
  const showFeatured = page === 1 && !search && !category && articles.length > 3;
  const leadStory = showFeatured ? articles[0] : null;
  const gridArticles = showFeatured ? articles.slice(1) : articles;

  const leadTimeAgo = leadStory
    ? leadStory.publishedAt || leadStory.createdAt
      ? formatDistanceToNow(new Date(leadStory.publishedAt || leadStory.createdAt || ""), {
          addSuffix: true,
        })
      : "recent wire"
    : "";

  return (
    <div className="space-y-10">
      {/* FEATURED LEAD DISPATCH ON PAGE 1 */}
      {leadStory && (
        <article className="border-2 border-[#1A1715] bg-[#FAF7F2] p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-7 aspect-[16/10] overflow-hidden bg-[#F3EDE5] border border-[#E2D9CE]">
            <Link href={`/articles/${leadStory.slug}`}>
              <img
                src={optimizeImageUrl(leadStory.coverImage, 1200)}
                alt={leadStory.title}
                className="w-full h-full object-cover filter contrast-[1.02] hover:scale-102 transition-transform duration-500"
              />
            </Link>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-sans text-[10px] uppercase font-bold tracking-widest text-[#C2410C]">
                <span>Featured Dispatch</span>
                <span className="text-[#D1C4B5]">•</span>
                <span className="text-[#68635D]">
                  {leadStory.category?.name || "Global Beat"}
                </span>
              </div>

              <Link href={`/articles/${leadStory.slug}`} className="group block">
                <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#1A1715] leading-tight group-hover:text-[#C2410C] transition-colors">
                  {leadStory.title}
                </h2>
              </Link>

              {leadStory.excerpt && (
                <p className="font-serif text-sm text-[#3C3835] leading-relaxed line-clamp-3">
                  {leadStory.excerpt}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-[#E2D9CE] flex items-center justify-between font-sans text-xs text-[#68635D]">
              <span>
                By <span className="font-bold text-[#1A1715]">{leadStory.author?.name || "The Commons Voice"}</span> · {leadTimeAgo}
              </span>
              <Link
                href={`/articles/${leadStory.slug}`}
                className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[#1A1715] hover:text-[#C2410C] transition-colors text-[11px]"
              >
                <span>Read Dispatch</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </article>
      )}

      {/* DISPATCHES GRID */}
      <div>
        <div className="flex items-center justify-between border-b border-[#E2D9CE] pb-2 mb-6 font-sans text-xs">
          <span className="font-bold uppercase tracking-widest text-[11px] text-[#1A1715]">
            Chronological Register ({pagination.total} Dispatches)
          </span>
          <span className="text-[#68635D] text-[11px]">
            Page {page} of {pagination.totalPages}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridArticles.map((article) => (
            <div key={article.id}>
              <ArticleCard article={article} variant="default" />
            </div>
          ))}
        </div>
      </div>

      {/* PAGINATION */}
      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        basePath="/articles"
        searchQuery={search || undefined}
        extraParams={category ? { category } : undefined}
      />
    </div>
  );
}
