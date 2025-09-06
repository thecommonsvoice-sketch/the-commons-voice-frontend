"use client"
import Link from "next/link";
import { formatDistanceToNow, set } from "date-fns";
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
  variant?: "default" | "featured" | "compact";
  show?: boolean;
}

export function ArticleCard({ article, variant = "default", show = true }: ArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [disable, setDisable] = useState(false);

  const { user } = useUserStore();
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  const publishedDate = article.createdAt
    ? formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })
    : "";

  const changeBookmarkStatus = async () => {
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
    finally{
        setDisable(false);
      }
  };

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      if (user && article.id) {
        try {
          const res = await api.get(`bookmarks/${article.id}`);
          setIsBookmarked(res.data.success);
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchBookmarkStatus();
  }, [article.id, user]);

  return (
    <>
      <Card
        className={`group overflow-hidden transition-all duration-300 hover:shadow-xl ${
          isFeatured ? "lg:col-span-2" : ""
        }`}
      >
        <Link href={`/articles/${article.slug}`} className="block">
          <div
            className={`relative overflow-hidden ${
              isFeatured ? "aspect-[2/1]" : isCompact ? "aspect-[4/3]" : "aspect-video"
            }`}
          >
            {article.coverImage ? (
              <>
                <img
                  src={article.coverImage}
                  alt={article.title}
                  className="h-full w-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </>
            ) : (
              <div className="h-full w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-sm">
                No image available
              </div>
            )}
            {article.category && (
              <Badge
                variant="secondary"
                className="absolute top-2 left-2 bg-white/95 dark:bg-black/70 text-black dark:text-white shadow px-2 py-1 text-xs"
              >
                {article.category.name}
              </Badge>
            )}
          </div>

          <CardContent className={`space-y-2 ${isCompact ? "p-3" : "p-4"}`}>
            <h3
              className={`font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2 ${
                isFeatured ? "text-xl sm:text-2xl" : isCompact ? "text-sm" : "text-base sm:text-lg"
              }`}
            >
              {article.title}
            </h3>

            {!isCompact && article.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {article.excerpt}
              </p>
            )}

            <div
              className={`flex items-center justify-between text-xs text-muted-foreground ${
                isCompact ? "mt-1" : "mt-3"
              }`}
            >
              <span className="truncate">{article.author?.name || "Staff Reporter"}</span>
              {publishedDate && <span>{publishedDate}</span>}
            </div>
          </CardContent>
        </Link>

        <CardFooter className={`${show ? "p-2" : "hidden"}`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Button
              disabled={disable}
                onClick={() => setIsCommentsOpen(true)}
                className="flex items-center hover:text-white bg-transparent dark:bg-transparent p-1 rounded text-black dark:hover:text-black dark:text-white"
              >
                <MessageSquareMore size={16} />
              </Button>
            </div>
            {user && (
              <Button
                onClick={changeBookmarkStatus}
                aria-label={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
                className="p-1 rounded hover:text-white bg-transparent dark:bg-transparent text-black dark:hover:text-black dark:text-white"
              >
                {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </Button>
            )}
          </div>
        </CardFooter>
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
