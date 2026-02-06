"use client"
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Article } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/useUserStore";
import { Bookmark, BookmarkCheck, MessageSquareMore } from "lucide-react";
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

export function ArticleCard({ article, variant = "default", show = true }: ArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [disable, setDisable] = useState(false);

  const { user } = useUserStore();
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";
  const isHorizontal = variant === "horizontal";

  const publishedDate = article.createdAt
    ? formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })
    : "";

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
        className={`group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-card rounded-xl overflow-hidden h-full flex flex-col 
          ${isFeatured ? "sm:col-span-2 lg:col-span-2" : isHorizontal ? "flex-row h-auto min-h-[140px]" : ""}`}
      >
        <Link href={`/articles/${article.slug}`} className={`flex-1 flex ${isHorizontal ? "flex-row gap-4" : "flex-col"}`}>
          {/* Image Container */}
          <div className={`relative overflow-hidden ${isHorizontal ? "w-1/3 aspect-[4/3] sm:aspect-video h-auto shrink-0" : "aspect-video"}`}>
            {article.coverImage ? (
              <>
                <img
                  src={article.coverImage}
                  alt={article.title}
                  loading="lazy"
                  className="h-full w-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
              </>
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
                No image available
              </div>
            )}

            {article.category && (
              <Badge
                className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 hover:bg-white text-black dark:text-white backdrop-blur-sm border-none shadow-sm font-medium"
              >
                {article.category.name}
              </Badge>
            )}
          </div>

          {/* Content */}
          <CardContent className={`flex-1 flex flex-col ${isCompact ? "p-3" : isHorizontal ? "p-3 sm:p-4 justify-between" : "p-4 sm:p-5"}`}>
            <div>
              <h3
                className={`font-bold font-serif leading-tight group-hover:text-primary transition-colors text-foreground mb-2 line-clamp-2 
                  ${isFeatured ? "text-xl sm:text-2xl" : isCompact ? "text-base" : isHorizontal ? "text-lg sm:text-xl" : "text-lg sm:text-xl"}`}
              >
                {article.title}
              </h3>

              {!isCompact && article.excerpt && (
                <p className={`text-sm text-muted-foreground leading-relaxed ${isHorizontal ? "line-clamp-2 md:line-clamp-3 mb-2" : "line-clamp-2 mb-4"}`}>
                  {article.excerpt}
                </p>
              )}
            </div>

            <div className={`flex items-center justify-between mt-auto pt-2 text-xs sm:text-sm text-muted-foreground ${isHorizontal ? "" : "border-t border-border/50 w-full"}`}>
              <div className="flex items-center gap-2">
                {article.author?.name && (
                  <span className="font-medium text-foreground/80">{article.author.name}</span>
                )}
                {article.author?.name && publishedDate && <span>•</span>}
                {publishedDate && <span>{publishedDate}</span>}
              </div>
            </div>
          </CardContent>
        </Link>

        {/* Actions Footer */}
        {show && !isHorizontal && (
          <CardFooter className="p-0 px-4 pb-4 mt-0 pt-0 flex justify-end gap-2 border-t border-transparent group-hover:border-border/40 transition-colors">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={openComments}
              title="Comments"
            >
              <MessageSquareMore className="w-4 h-4" />
            </Button>

            {user && (
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 transition-colors ${isBookmarked ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}
                onClick={changeBookmarkStatus}
                disabled={disable}
                title={isBookmarked ? "Remove Bookmark" : "Bookmark"}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </Button>
            )}
          </CardFooter>
        )}
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
