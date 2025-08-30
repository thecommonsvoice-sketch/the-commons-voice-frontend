import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Article } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "featured" | "compact";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  const isLarge = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/articles/${article.slug}`}>
        <div className={`relative ${isLarge ? "aspect-[2/1]" : isCompact ? "aspect-[3/2]" : "aspect-video"}`}>
          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
          {article.category && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-white/90 text-black hover:bg-white"
            >
              {article.category.name}
            </Badge>
          )}
        </div>
        <CardContent className={`p-4 ${isCompact ? "p-3" : ""}`}>
          <h3 className={`font-semibold leading-tight group-hover:text-primary transition-colors ${
            isLarge ? "text-xl" : isCompact ? "text-sm" : "text-base"
          }`}>
            {article.title}
          </h3>
          {article.excerpt && !isCompact && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {article.excerpt}
            </p>
          )}
          <div className={`flex items-center justify-between text-xs text-muted-foreground ${
            isCompact ? "mt-1" : "mt-3"
          }`}>
            <span>{article.author?.name}</span>
            {article.createdAt && (
              <span>{formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}</span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}