"use client";

import { useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import type { Article, Category } from "@/lib/types";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Hero Banner */}
      <div className="relative bg-muted/40 dark:bg-muted/10 rounded-3xl p-8 md:p-16 mb-12 overflow-hidden text-center border">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none">
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
