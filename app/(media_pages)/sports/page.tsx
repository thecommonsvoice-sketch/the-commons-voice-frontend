// app/sports/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import NewsCard from "@/components/NewsCard";

export type NewsArticle = {
  id: string;
  title: string;
  description: string;
  photoUrl?: string;
  link: string;
  type?: string;
  published_at?: string;
};

export default function SportsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE: string = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const fetchSportsNews = async (): Promise<void> => {
      try {
        const res: Response = await fetch(`${API_BASE}/news/sports`);
        if (!res.ok) throw new Error("Failed to fetch sports news");

        const data: NewsArticle[] = await res.json();
        setNews(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error fetching Sports news:", err.message);
        }
			console.log(err)
      } finally {
        setLoading(false);
      }
    };

    fetchSportsNews();
  }, [API_BASE]);

  return (
    <main className="relative p-6 max-w-7xl mx-auto">
      {/* Decorative floating elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-green-200/20 rounded-full -z-10 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full -z-10 blur-3xl" />

      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Sports News
      </h1>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 dark:bg-gray-700 h-72 rounded-xl"
            />
          ))}
        </div>
      )}

      {error && <p className="text-center mt-8 text-red-500">{error}</p>}

      {!loading && news.length === 0 && (
        <p className="text-center mt-8 text-gray-500">
          No sports news available at the moment.
        </p>
      )}

      {!loading && news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article, index) => (
            <div key={article.id} className="relative group">
              {/* Decorative badge */}
              {index % 4 === 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full font-semibold z-10">
                  Hot
                </span>
              )}
              {/* Category badge */}
              <span className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs rounded-full z-10">
                Sports
              </span>

              <NewsCard article={article} />
            </div>
          ))}
        </div>
      )}

      {/* Decorative divider */}
      <div className="mt-12 h-px bg-gray-300 dark:bg-gray-700 opacity-30"></div>

      {/* Footer placeholder */}
      <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
        Keep up with the latest sports updates and highlights! ⚽🏀🏏
      </div>
    </main>
  );
}
