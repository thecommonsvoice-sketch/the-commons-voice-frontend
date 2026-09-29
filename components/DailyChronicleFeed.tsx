"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Article, Category } from "@/lib/types";
import { MessageSquare, Bookmark, BookmarkCheck } from "lucide-react";
import { CommentsSidebar } from "@/components/CommentSidebar";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface DailyChronicleFeedProps {
  initialArticles: Article[];
  categories: Category[];
}

function optimizeImageUrl(url: string | undefined | null, width = 600): string {
  if (!url) return "/placeholder.jpg";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

function getArticleSummary(article: Article, maxLength = 210): string {
  if (article.excerpt && article.excerpt.trim().length > 0) {
    return article.excerpt.trim();
  }
  if (article.content) {
    const clean = article.content
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (clean.length > maxLength) {
      return clean.slice(0, maxLength).trim() + "…";
    }
    return clean;
  }
  return "Comprehensive field reporting and verified dispatches recorded from our editorial desk.";
}

function getCategoryBadgeStyle(catName?: string, catSlug?: string): string {
  const q = (catSlug || catName || "").toLowerCase();
  if (q.includes("politic")) return "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]";
  if (q.includes("defence") || q.includes("defense")) return "bg-[#FEFCE8] text-[#A16207] border-[#FEF08A]";
  if (q.includes("world") || q.includes("diploma")) return "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]";
  if (q.includes("business") || q.includes("econom")) return "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]";
  if (q.includes("tech") || q.includes("science")) return "bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]";
  if (q.includes("sport") || q.includes("entertain")) return "bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]";
  return "bg-[#F8FAFC] text-[#334155] border-[#CBD5E1]";
}

export function DailyChronicleFeed({ initialArticles, categories }: DailyChronicleFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeArticleForComments, setActiveArticleForComments] = useState<string | null>(null);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialArticles.forEach((a) => {
      if (a.isBookmarked) map[a.id] = true;
    });
    return map;
  });

  const { user } = useUserStore();

  const handleToggleBookmark = async (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Sign in to bookmark dispatches to your portfolio");
      return;
    }

    const currentStatus = !!bookmarkedMap[articleId];
    try {
      if (currentStatus) {
        await api.delete("bookmarks", { data: { articleId } });
        setBookmarkedMap((prev) => ({ ...prev, [articleId]: false }));
        toast.success("Dispatch removed from archives");
      } else {
        await api.post("bookmarks", { articleId });
        setBookmarkedMap((prev) => ({ ...prev, [articleId]: true }));
        toast.success("Dispatch archived to your folio");
      }
    } catch {
      toast.error("Action could not be recorded");
    }
  };

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "all") return initialArticles;
    return initialArticles.filter((a) => {
      const catSlug = a.category?.slug?.toLowerCase() || "";
      const catName = a.category?.name?.toLowerCase() || "";
      const query = selectedCategory.toLowerCase();
      return catSlug.includes(query) || catName.includes(query);
    });
  }, [initialArticles, selectedCategory]);

  return (
    <>
      <div className="border-b-2 border-[#1A1715] pb-3 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-y-3">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-widest font-extrabold text-[#DC2626] block">
            Section Two
          </span>
          <h3 className="font-headline text-2xl sm:text-3xl font-bold text-[#1A1715] leading-none">
            The Daily Chronicle &amp; Dispatches
          </h3>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 font-sans text-[11px]">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 uppercase tracking-wider font-bold text-[10px] transition-colors rounded-none border ${
              selectedCategory === "all"
                ? "bg-[#DC2626] text-white border-[#DC2626] shadow-xs"
                : "bg-white hover:bg-[#F8FAFC] text-[#334155] border-[#CBD5E1]"
            }`}
          >
            All
          </button>
          {categories.slice(0, 5).map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1 uppercase tracking-wider font-bold text-[10px] transition-colors rounded-none border ${
                  isSelected
                    ? "bg-[#DC2626] text-white border-[#DC2626] shadow-xs"
                    : "bg-white hover:bg-[#F8FAFC] text-[#334155] border-[#CBD5E1]"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Articles Feed in Crisp White Cards */}
      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => {
            const dateStr = article.publishedAt || article.createdAt;
            const timeAgo = dateStr
              ? formatDistanceToNow(new Date(dateStr), { addSuffix: true })
              : "recent wire";
            const isBookmarked = !!bookmarkedMap[article.id];
            const badgeClass = getCategoryBadgeStyle(article.category?.name, article.category?.slug);

            return (
              <article
                key={article.id}
                className="bg-white p-5 sm:p-6 border border-[#E5DDD0] hover:border-[#DC2626] shadow-2xs hover:shadow-xs transition-all group grid grid-cols-1 md:grid-cols-12 gap-5 items-start"
              >
                <div className="md:col-span-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-sans text-[10px] uppercase font-bold tracking-widest mb-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 border text-[9.5px] font-extrabold tracking-wider ${badgeClass}`}>
                        {article.category?.name || "Dispatch"}
                      </span>
                      <span className="text-[#D1C4B5]">|</span>
                      <span className="text-[#68635D]">Global Bureau</span>
                    </div>

                    <Link href={`/articles/${article.slug}`} className="block group">
                      <h4 className="font-headline text-xl sm:text-2xl font-bold text-[#1A1715] leading-snug group-hover:text-[#DC2626] transition-colors">
                        {article.title}
                      </h4>
                    </Link>

                    <p className="font-serif text-[13.5px] sm:text-sm text-[#3C3835] mt-2.5 leading-relaxed line-clamp-3">
                      {getArticleSummary(article)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 font-sans text-[11px] text-[#68635D] mt-4 pt-2 border-t border-[#F3EDE5]">
                    <span className="font-bold text-[#1A1715]">
                      {article.author?.name || "The Commons Voice"}
                    </span>
                    <span>•</span>
                    <span>{timeAgo}</span>
                    <div className="ml-auto flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveArticleForComments(article.id)}
                        className="flex items-center gap-1 hover:text-[#1A1715] cursor-pointer text-[11px]"
                        title="View reader discussion"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Discussion</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(e, article.id)}
                        className={`hover:text-[#C2410C] transition-colors ${
                          isBookmarked ? "text-[#C2410C]" : "text-[#68635D]"
                        }`}
                        title={isBookmarked ? "Remove from archives" : "Archive to folio"}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 aspect-[16/10] w-full overflow-hidden bg-[#F3EDE5] border border-[#E2D9CE]">
                  <Link href={`/articles/${article.slug}`}>
                    <img
                      src={optimizeImageUrl(article.coverImage, 600)}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                </div>
              </article>
            );
          })
        ) : (
          <div className="py-12 text-center text-[#68635D] font-serif italic">
            No dispatches filed under this beat today. Please select &quot;All&quot; to review general archives.
          </div>
        )}
      </div>

      {activeArticleForComments && (
        <CommentsSidebar
          articleId={activeArticleForComments}
          onClose={() => setActiveArticleForComments(null)}
        />
      )}
    </>
  );
}
