import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import type { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/articles/${slug}`, { 
      cache: "no-store",
      next: { revalidate: 300 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.article ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "Article Not Found" };

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt || `Read ${article.title} on The Common Voice`;

  return {
    title,
    description,
    keywords: [article.category?.name, "news", "journalism"].filter((k): k is string => typeof k === "string"),
    authors: article.author?.name ? [{ name: article.author.name }] : undefined,
    openGraph: {
      title,
      description,
      images: article.ogImage || article.coverImage ? [{ 
        url: article.ogImage || article.coverImage!,
        alt: article.title 
      }] : undefined,
      type: "article",
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.ogImage || article.coverImage ? [article.ogImage || article.coverImage!] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author?.name,
    },
    publisher: {
      "@type": "Organization",
      name: "The Common Voice",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
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
        </article>
      </div>
    </>
  );
}