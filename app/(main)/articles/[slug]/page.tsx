import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import type { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// import { AdSlot } from "@/components/AdSlot";
import Link from "next/link";
import { ArticleCommentsClient } from "@/components/ArticleCommentsClient";

// --- Fetch Single Article ---
async function getArticle(slug: string): Promise<Article | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/articles/${slug}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.article ?? null;
  } catch {
    return null;
  }
}

// --- Fetch Related Articles ---
async function getRelatedArticles(categorySlug: string, excludeSlug: string) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(
      `${base}/articles?category=${categorySlug}&limit=4&exclude=${excludeSlug}`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

// --- Fetch Next & Previous Articles ---
async function getAdjacentArticles(slug: string) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/articles/adjacent/${slug}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return { next: null, prev: null };
    const data = await res.json();
    return {
      next: data?.next ?? null,
      prev: data?.prev ?? null,
    };
  } catch {
    return { next: null, prev: null };
  }
}

// --- SEO Metadata ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article Not Found" };

  const title = article.metaTitle || article.title;
  const description =
    article.metaDescription ||
    article.excerpt ||
    `Read ${article.title} on The Commons Voice`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
    },
  };
}

// --- Page Component ---
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const [relatedArticles, adjacent] = await Promise.all([
    article.category?.slug ? getRelatedArticles(article.category.slug, slug) : Promise.resolve([]),
    getAdjacentArticles(slug)
  ]);
  const { next, prev } = adjacent;

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
      name: "The Commons Voice",
      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`,
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        <article className="space-y-4 sm:space-y-6">
          {/* Ad: Leaderboard */}
          {/* <AdSlot slot="article-top" width={970} height={250} className="mx-auto mb-4 sm:mb-6 hidden md:block" /> */}

          {/* Header */}
          <header className="space-y-3 sm:space-y-4">
            {article.category && (
              <Link href={`/category/${article.category.slug}`}>
                <Badge variant="secondary" className="mb-2 cursor-pointer">
                  {article.category.name}
                </Badge>
              </Link>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
              {article.author?.name && (
                <span>
                  By{" "}
                  <span className="font-medium">{article.author.name}</span>
                </span>
              )}
              {article.createdAt && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <time dateTime={article.createdAt}>
                    {formatDistanceToNow(new Date(article.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                </>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {article.coverImage && (
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <img
                src={article.coverImage}
                alt={article.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-sm sm:prose-base md:prose-lg prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Inline Ad */}
          {/* <AdSlot slot="article-inline" width={728} height={90} className="mx-auto my-8" /> */}

          {/* Videos */}
          {Array.isArray(article.videos) && article.videos.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold">Videos</h2>
              {article.videos.map((vid, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden border">
                  {vid.type === "embed" ? (
                    <div className="w-full max-w-2xl mx-auto max-h-72">
                      <iframe
                        src={vid.url.replace('youtu.be/', 'www.youtube.com/embed/').replace('watch?v=', 'embed/')}
                        title={vid.title || `Video ${idx + 1}`}
                        className="w-full h-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-2xl mx-auto">
                      <video controls className="w-full h-auto max-h-56 object-contain" style={{ backgroundColor: '#000' }}>
                        <source src={vid.url} />
                        Your browser does not support the video tag.
                      </video>
                    </div>
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

          {/* Next & Previous Navigation */}
          {(next || prev) && (
            <div className="flex justify-between mt-10 border-t pt-6">
              {prev ? (
                <Link href={`/articles/${prev.slug}`} className="text-primary hover:underline">
                  ← {prev.title}
                </Link>
              ) : <span />}
              {next ? (
                <Link href={`/articles/${next.slug}`} className="text-primary hover:underline">
                  {next.title} →
                </Link>
              ) : <span />}
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold mb-4">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {relatedArticles.map((related: Article) => (
                  <Link
                    key={related.id}
                    href={`/articles/${related.slug}`}
                    className="group block rounded-lg border hover:shadow-md transition p-4"
                  >
                    <h3 className="text-lg font-medium group-hover:text-primary">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {related.excerpt}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Comments Section */}
          <section className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-semibold mb-6">Comments</h2>
            <ArticleCommentsClient articleId={article.id} />
          </section>
        </article>
      </div>
    </>
  );
}
