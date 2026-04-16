// components/NewsCard.tsx
import React from "react";

type NewsArticle = {
  title: string;
  description?: string;
  photoUrl?: string;
  link: string;
  type?: string;
  published_at?: string;
};

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  if (!article) return null;

  const { title, description, photoUrl, link, type, published_at } = article;

  const formattedDate = published_at
    ? new Date(published_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-gray-800 h-96">
      {/* Image Section */}
      {photoUrl ? (
        <div className="relative h-48 w-full">
          <img
            src={photoUrl}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
          {/* Hover Read More overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md mb-4 text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition"
            >
              Read More
            </a>
          </div>
        </div>
      ) : (
        <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300">
          No Image
        </div>
      )}

      {/* Content Section */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3">
              {description}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
          <span>{formattedDate}</span>
          {type && (
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] uppercase">
              {type}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
