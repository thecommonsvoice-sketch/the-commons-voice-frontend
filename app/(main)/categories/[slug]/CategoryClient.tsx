"use client";

import { useState } from "react";
import Image from "next/image";
import { ArticleCard } from "@/components/ArticleCard";
import type { Article, Category } from "@/lib/types";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const CATEGORY_BACKGROUNDS: Record<string, string> = {
  // General News
  general: "https://images.unsplash.com/photo-1495020689067-958852a6565d?auto=format&fit=crop&w=1200&q=80",
  
  // Politics
  politics: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80",
  
  // Science and Technology
  "science-and-technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  "science-technology": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  science: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  
  // Sports and Entertainment
  "sports-and-entertainment": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
  "sports-entertainment": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
  sport: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
  entertainment: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
  
  // Business
  business: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  finance: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  
  // World News
  world: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  
  // Defence
  defence: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&w=1200&q=80",
  defense: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?auto=format&fit=crop&w=1200&q=80",
};

const getCategoryBackground = (slug: string) => {
  const normalizedSlug = slug.toLowerCase().trim();
  if (CATEGORY_BACKGROUNDS[normalizedSlug]) {
    return CATEGORY_BACKGROUNDS[normalizedSlug];
  }
  return "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80";
};

export default function CategoryClient({
  category,
  initialArticles,
  initialPagination,
}: {
  category: Category;
  initialArticles: Article[];
  initialPagination: { total: number; totalPages: number };
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [pagination, setPagination] = useState(initialPagination);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchArticles = async (searchTerm: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await api.get("/articles", {
        params: {
          category: category.slug,
          search: searchTerm,
          page: pageNum,
          limit: 9,
        },
      });
      setArticles(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchArticles(search, 1);
  };

  const handlePagination = (pageNum: number) => {
    setPage(pageNum);
    fetchArticles(search, pageNum);
  };

  const bgImage = category.image || category.coverImage || getCategoryBackground(category.slug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Hero Banner */}
      <div className="relative rounded-3xl p-8 md:p-16 mb-12 overflow-hidden text-center border bg-muted/20 dark:bg-muted/5 group">
        {/* Background Image */}
        {bgImage && (
          <>
            <Image
              src={bgImage}
              alt={category.name}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
            />
            {/* Elegant glassmorphic overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-background/90 dark:from-background/95 dark:via-background/80 dark:to-background/95 backdrop-blur-[1px] pointer-events-none" />
          </>
        )}

        {/* Background Pattern SVG overlay */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif tracking-tight text-primary">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Search Bar */}
          <div className="pt-6 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search in ${category.name}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 bg-background/80 backdrop-blur"
              />
            </div>
            <Button onClick={handleSearch}>
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
          ))}
        </div>
      )}

      {/* Articles Grid */}
      {!loading && articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((article) => (
            <div key={article.id} className="h-full">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-20 rounded-xl border-2 border-dashed border-muted text-muted-foreground bg-muted/20">
          <p className="text-lg font-medium">No articles found in this category.</p>
          <Button variant="link" onClick={() => { setSearch(""); fetchArticles("", 1); }}>
            Clear search
          </Button>
        </div>
      ) : null}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => handlePagination(page - 1)}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1 mx-2">
            <span className="text-sm font-medium px-4 py-2 bg-muted rounded-md min-w-[3rem] text-center">
              {page}
            </span>
            <span className="text-muted-foreground text-sm">of {pagination.totalPages}</span>
          </div>

          <Button
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => handlePagination(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
