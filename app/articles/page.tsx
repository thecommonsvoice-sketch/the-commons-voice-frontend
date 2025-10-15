import { Suspense } from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AdSlot } from "@/components/AdSlot";
import { SearchBar } from "@/components/SearchBar"; // New reusable search bar
import type { Article } from "@/lib/types";

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
};

async function getArticles(page: number, search = ""): Promise<{
  articles: Article[];
  pagination: { total: number; totalPages: number };
}> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const url = `${base}/articles?page=${page}&limit=12&search=${encodeURIComponent(search)}`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    if (!res.ok) return { articles: [], pagination: { total: 0, totalPages: 1 } };
    const data = await res.json();

    return {
      articles: Array.isArray(data?.data) ? data.data : [],
      pagination: data.pagination ?? { total: 0, totalPages: 1 },
    };
  } catch {
    return { articles: [], pagination: { total: 0, totalPages: 1 } };
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
  searchParams?: { page?: string; q?: string };
}) {
  const page = parseInt(searchParams?.page || "1", 10);
  const search = searchParams?.q || "";

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Leaderboard Ad */}
      <AdSlot slot="leaderboard" width={970} height={250} className="mx-auto mb-4 sm:mb-6 hidden md:block" />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">All Articles</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Stay updated with the latest breaking news, trending stories, and in-depth analysis.
        </p>
      </div>

      {/* Search Bar */}
      <SearchBar placeholder="Search articles..." defaultValue={search} />

      <Suspense fallback={<ArticlesSkeleton />}>
        <ArticlesList page={page} search={search} />
      </Suspense>

      {/* Bottom Ad */}
      <AdSlot slot="footer-inline" width={728} height={90} className="mx-auto my-8" />
    </div>
  );
}

async function ArticlesList({ page, search }: { page: number; search: string }) {
  const { articles, pagination } = await getArticles(page, search);

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No articles found at the moment.</p>
        <Link href="/" className="text-primary underline mt-2 block">
          Go back to homepage
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {articles.map((article, index) => (
          <div key={article.id}>
            {/* Insert inline ads after every 6 articles */}
            {index > 0 && index % 6 === 0 && (
              <AdSlot slot={`inline-${index}`} width={300} height={250} className="my-4" />
            )}
            <ArticleCard article={article} variant="default" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
          <Link
            href={`/articles?page=${page - 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
            className={`w-full sm:w-auto px-4 py-2 border rounded-md text-center text-sm sm:text-base ${
              page <= 1 ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Previous
          </Link>
          <span className="text-xs sm:text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Link
            href={`/articles?page=${page + 1}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
            className={`w-full sm:w-auto px-4 py-2 border rounded-md text-center text-sm sm:text-base ${
              page >= pagination.totalPages ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </>
  );
}
