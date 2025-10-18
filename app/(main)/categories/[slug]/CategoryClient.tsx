"use client";

import { useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import type { Article, Category } from "@/lib/types";
import { api } from "@/lib/api";

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
      {/* Category Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-muted-foreground">{category.description}</p>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-4 justify-center">
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-full max-w-md px-4 py-2 border rounded-md"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      )}

      {/* Articles Grid */}
      {!loading && articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-12 text-muted-foreground">
          No articles found.
        </div>
      ) : null}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            disabled={page <= 1}
            onClick={() => handlePagination(page - 1)}
            className={`px-4 py-2 border rounded-md ${
              page <= 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => handlePagination(page + 1)}
            className={`px-4 py-2 border rounded-md ${
              page >= pagination.totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
