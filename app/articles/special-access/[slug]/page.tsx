"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import type { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import SpecialRoutes from "@/components/specialRoutes";
import { toast } from "sonner";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await api.get(`/articles/role-check/${slug}`);
        setArticle(data?.article ?? null);
      } catch (error: any) {
        console.error("Failed to fetch article:", error);
        if (error.response?.status === 403) {
          toast.error("Access denied: You don't have permission to view this article");
          router.push("/dashboard");
        } else if (error.response?.status === 401) {
          toast.error("Please log in to view this article");
          router.push("/login");
        } else {
          toast.error("Article not found");
          router.push("/dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, router]);

  if (loading) {
    return (
      <SpecialRoutes>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </SpecialRoutes>
    );
  }

  if (!article) {
    return null; // Will redirect in useEffect
  }

  return (
    <SpecialRoutes>
             <div className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="space-y-6">
          {/* Article header */}
          <header className="space-y-4">
            {article.category && (
              <Badge variant="secondary" className="mb-2">
                {article.category.name}
              </Badge>
            )}
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {article.author?.name && (
                <span>By <span className="font-medium">{article.author.name}</span></span>
              )}
              {article.createdAt && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}</span>
                </>
              )}
            </div>
          </header>

          {/* Featured image */}
          {article.coverImage && (
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <img
                src={article.coverImage}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Article content */}
          <div 
            className="prose prose-lg prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Videos */}
          {Array.isArray(article.videos) && article.videos.length > 0 && (
            <section className="space-y-6 mt-8">
              <h2 className="text-2xl font-semibold">Videos</h2>
              {article.videos.map((vid, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden border">
                  {vid.type === "embed" ? (
                    <div className="aspect-video">
                      <iframe
                        src={vid.url.replace('youtu.be/', 'www.youtube.com/embed/').replace('watch?v=', 'embed/')}
                        title={vid.title || `Video ${idx + 1}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video controls className="w-full">
                      <source src={vid.url} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  {(vid.title || vid.description) && (
                    <div className="p-4 space-y-1 bg-gray-50 dark:bg-gray-800">
                      {vid.title && <h3 className="text-lg font-medium">{vid.title}</h3>}
                      {vid.description && (
                        <p className="text-sm text-muted-foreground">{vid.description}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </article>
      </div>
        </SpecialRoutes>
  );
}