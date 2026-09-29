"use client"
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Article } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/useUserStore";
import { Bookmark, BookmarkCheck, MessageSquareMore, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CommentsSidebar } from "@/components/CommentSidebar";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact" | "horizontal";
  show?: boolean;
}

/** Optimize Cloudinary URLs with auto-format (WebP/AVIF) and responsive width */
function optimizeImageUrl(url: string | undefined | null, width = 800): string {
  if (!url) return "/placeholder.jpg";
  // Only transform Cloudinary URLs
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

function getCategoryBadgeClass(categoryName?: string) {
  if (!categoryName) return "bg-primary/10 text-primary border-primary/20";
  const lower = categoryName.toLowerCase();
  if (lower.includes("politic")) return "bg-red-100 text-red-900 border-red-300";
  if (lower.includes("tech") || lower.includes("science")) return "bg-cyan-100 text-cyan-950 border-cyan-300";
  if (lower.includes("business")) return "bg-emerald-100 text-emerald-950 border-emerald-300";
  if (lower.includes("sport") || lower.includes("entertain")) return "bg-amber-100 text-amber-950 border-amber-300";
  if (lower.includes("world")) return "bg-blue-100 text-blue-950 border-blue-300";
  return "bg-stone-100 text-stone-900 border-stone-300";
}

export function ArticleCard({ article, variant = "default", show = true }: ArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [disable, setDisable] = useState(false);

  const { user } = useUserStore();
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const isHorizontal = variant === "horizontal";

  const dateStr = article.publishedAt || article.createdAt;
  const publishedDate = dateStr
    ? formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    : "";

  const readTime = Math.max(2, Math.ceil((article.content?.length || 600) / 1000));

  const changeBookmarkStatus = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    if (!user || !article?.id) {
      toast.error("You need to be logged in to bookmark articles");
      return;
    }

    try {
      if (isBookmarked) {
        setDisable(true);
        await api.delete(`bookmarks`, { data: { articleId: article.id } });
        setIsBookmarked(false);
        toast.success("Bookmark removed");
      } else {
        await api.post(`bookmarks`, { articleId: article.id });
        setIsBookmarked(true);
        toast.success("Article bookmarked");
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast.error("Something went wrong");
    }
    finally {
      setDisable(false);
    }
  };

  const openComments = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCommentsOpen(true);
  };

  useEffect(() => {
    if (article.isBookmarked !== undefined) {
      setIsBookmarked(article.isBookmarked);
    }
  }, [article.isBookmarked]);

  return (
    <>
      <Card
        className={`group relative border border-[#E2D9CE] hover:border-[#1A1715] transition-all duration-300 bg-[#FAF7F2] rounded-none overflow-hidden h-full flex flex-col shadow-none
          ${isFeatured ? "sm:col-span-2 lg:col-span-2" : isHorizontal ? "flex-row h-auto min-h-[150px]" : ""}`}
      >
        <Link href={`/articles/${article.slug}`} prefetch={false} className={`flex-1 flex ${isHorizontal ? "flex-row gap-3 sm:gap-5" : "flex-col"}`}>
          {/* Image Container */}
          <div className={`relative overflow-hidden bg-[#F3EDE5] border-b sm:border-b-0 border-[#E2D9CE] ${isHorizontal ? "w-2/5 sm:w-1/3 aspect-[4/3] h-auto shrink-0 border-r" : "aspect-video"}`}>
            {article.coverImage ? (
              <>
                <img
                  src={optimizeImageUrl(article.coverImage, isFeatured ? 1200 : isHorizontal ? 600 : 800)}
                  alt={article.title}
                  loading="lazy"
                  className="h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-102"
                />
              </>
            ) : (
              <div className="h-full w-full bg-[#F3EDE5] flex items-center justify-center text-[#68635D] text-xs font-sans">
                No photograph filed
              </div>
            )}

            {article.category && (
              <span
                className="absolute top-2.5 left-2.5 font-sans font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[#1A1715] text-[#FAF7F2] rounded-none shadow-xs"
              >
                {article.category.name}
              </span>
            )}
          </div>

          {/* Content */}
          <CardContent className={`flex-1 flex flex-col ${isCompact ? "p-3" : isHorizontal ? "p-3 sm:p-4 justify-between" : "p-4 sm:p-5"}`}>
            <div>
              <h3
                className={`font-bold font-headline leading-snug text-[#1A1715] group-hover:text-[#C2410C] transition-colors mb-2 line-clamp-2 
                  ${isFeatured ? "text-xl sm:text-2xl" : isCompact ? "text-base" : isHorizontal ? "text-base sm:text-lg" : "text-base sm:text-lg"}`}
              >
                {article.title}
              </h3>

              {!isCompact && article.excerpt && (
                <p className={`text-xs sm:text-sm text-[#3C3835] font-serif leading-relaxed ${isHorizontal ? "line-clamp-2 md:line-clamp-3 mb-2" : "line-clamp-2 mb-4"}`}>
                  {article.excerpt}
                </p>
              )}
            </div>

            {/* Metadata Footer Bar */}
            <div className={`flex items-center justify-between mt-auto pt-3 text-xs text-[#68635D] font-sans ${isHorizontal ? "" : "border-t border-[#E2D9CE] w-full"}`}>
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="font-bold text-[#1A1715]">
                  {article.author?.name || "The Commons Voice"}
                </span>
                <span>•</span>
                {publishedDate && <span>{publishedDate}</span>}
              </div>

              {/* Action Buttons for Both Vertical and Horizontal Cards */}
              {show && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-[#68635D] hover:text-[#C2410C] hover:bg-[#F3EDE5] transition-colors rounded-none"
                    onClick={openComments}
                    title="Comments"
                    aria-label="Open comments"
                  >
                    <MessageSquareMore className="w-3.5 h-3.5" />
                  </Button>

                  {user && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-7 w-7 transition-colors rounded-none ${isBookmarked ? "text-[#C2410C] bg-[#F3EDE5]" : "text-[#68635D] hover:text-[#C2410C] hover:bg-[#F3EDE5]"}`}
                      onClick={changeBookmarkStatus}
                      disabled={disable}
                      title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
                      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this article"}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>

      {isCommentsOpen && (
        <CommentsSidebar
          articleId={article.id}
          onClose={() => setIsCommentsOpen(false)}
        />
      )}
    </>
  );
}
