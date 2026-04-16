// app/fashion/page.tsx
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

export default function FashionPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE: string = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    const fetchFashionNews = async (): Promise<void> => {
      try {
        const res: Response = await fetch(`${API_BASE}/news/fashion`);
        if (!res.ok) throw new Error("Failed to fetch fashion news");

        const data: NewsArticle[] = await res.json();
        setNews(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error fetching Fashion news:", err.message);
        }
		console.log(err)
      } finally {
        setLoading(false);
      }
    };

    fetchFashionNews();
  }, [API_BASE]);

  return (
    <main className="relative p-6 max-w-7xl mx-auto">
      {/* Decorative floating circles and gradient blocks */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pink-200/20 rounded-full -z-10 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/20 rounded-full -z-10 blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-yellow-200/30 rounded-xl rotate-45 -z-10 blur-xl" />
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-green-200/30 rounded-full -z-10 blur-xl" />

      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Life & Style
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
          No fashion news available at the moment.
        </p>
      )}

      {!loading && news.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article, index) => (
            <div key={article.id} className="relative group">
              {/* Decorative badge */}
              {index % 3 === 0 && (
                <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full font-semibold z-10">
                  Trending
                </span>
              )}

              {/* Category badge */}
              <span className="absolute top-2 right-2 bg-pink-600 text-white px-2 py-1 text-xs rounded-full z-10">
                Fashion
              </span>

              <NewsCard article={article} />
            </div>
          ))}
        </div>
      )}

      {/* Extra decorative cards behind content */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-pink-100/30 rounded-2xl -z-20 rotate-12 shadow-lg" />
      <div className="absolute bottom-24 left-8 w-48 h-48 bg-purple-100/30 rounded-full -z-20 rotate-6 shadow-lg" />
      <div className="absolute bottom-10 right-1/2 w-32 h-32 bg-yellow-100/30 rounded-xl -z-20 blur-xl" />

      {/* Decorative divider */}
      <div className="mt-12 h-px bg-gray-300 dark:bg-gray-700 opacity-30"></div>

      {/* Footer placeholder */}
      <div className="mt-6 text-center text-gray-500 dark:text-gray-400">
        Stay updated with the latest fashion trends every day! 👗
      </div>
    </main>
  );
}
