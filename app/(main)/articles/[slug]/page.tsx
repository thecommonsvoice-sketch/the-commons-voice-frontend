import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import type { Article } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// import { AdSlot } from "@/components/AdSlot";
import Link from "next/link";
import { ArticleCommentsClient } from "@/components/ArticleCommentsClient";
import { SanitizedContent } from "@/components/SanitizedContent";
import ArticleLock from "@/components/ArticleLock";


// ISR Configuration
export const revalidate = 60; // Revalidate every 60 seconds
export const dynamicParams = true; // Allow dynamic params not in generateStaticParams

// --- Generate Static Params for ISR ---
export async function generateStaticParams() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

  try {
    const res = await fetch(`${base}/articles?limit=50&status=PUBLISHED`, {
      cache: 'no-store'  // Always fetch fresh during build
    });

    if (!res.ok) return [];

    const data = await res.json();
    const articles = data?.data || [];

    return articles.map((article: any) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// --- Fetch Single Article ---
async function getArticle(slug: string): Promise<Article | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/articles/${slug}`, {
      next: { revalidate: 60 },  // Reduced from 600 to 60 seconds
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.article ?? null;
  } catch {
    return null;
  }
}

// --- Fetch Related Articles (Tag-based + Category fallback) ---
async function getRelatedArticles(slug: string) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(
      `${base}/articles/related/${slug}?limit=4`,
      { next: { revalidate: 60 } }
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
      next: { revalidate: 60 },  // Reduced from 600 to 60 seconds
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
    keywords: article.tags?.length ? article.tags : undefined,
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt || article.createdAt,
      modifiedTime: article.updatedAt,
      // Pass the article's cover image or a default fallback
      images: article.coverImage
        ? [
            {
              url: article.coverImage,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.coverImage ? [article.coverImage] : undefined,
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

  const articleDate = article.publishedAt || article.createdAt;

  const [relatedArticles, adjacent] = await Promise.all([
    getRelatedArticles(slug),
    getAdjacentArticles(slug)
  ]);
  const { next, prev } = adjacent;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt || "",
    image: article.coverImage || "",
    datePublished: articleDate || article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author?.name || "The Commons Voice",
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
    ...(article.tags?.length ? { keywords: article.tags.join(', ') } : {}),
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-3xl lg:max-w-4xl">
        <article className="space-y-6 sm:space-y-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-primary transition-colors">Articles</Link>
            {article.category?.slug && (
              <>
                <span>/</span>
                <Link href={`/categories/${article.category.slug}`} className="text-primary hover:underline capitalize">
                  {article.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* Header */}
          <header className="space-y-4">
            {article.category?.slug && (
              <Link href={`/categories/${article.category.slug}`}>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
                  {article.category.name}
                </span>
              </Link>
            )}

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-serif tracking-tight text-foreground leading-[1.15]">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg sm:text-2xl text-muted-foreground leading-relaxed font-serif font-normal">
                {article.excerpt}
              </p>
            )}

            {/* Author & Date Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground py-4 border-y border-border/80 my-6">
              <div className="flex items-center gap-3">
                {article.author?.name && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-xs">
                      {article.author.name.charAt(0)}
                    </div>
                    <span>
                      By <span className="font-semibold text-foreground">{article.author.name}</span>
                    </span>
                  </div>
                )}
                {articleDate && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <time dateTime={articleDate} className="font-medium">
                      {(() => {
                        try {
                          return format(new Date(articleDate), "MMMM d, yyyy");
                        } catch (e) {
                          return "Date unavailable";
                        }
                      })()}
                    </time>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 bg-muted/60 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground">
                <span>📖</span>
                <span>{Math.max(2, Math.ceil((article.content?.length || 500) / 1000))} min read</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {article.coverImage && (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/60 shadow-sm bg-muted my-8">
              <Image
                src={article.coverImage.startsWith('http') ? article.coverImage : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${article.coverImage.startsWith('/') ? '' : '/'}${article.coverImage}`}
                alt={article.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-cover"
              />
            </div>
          )}

          {/* Content or Subscriber Paywall Lock */}
          {article.isSubscriberOnly || (article as any).locked || !article.content ? (
            <div className="space-y-6">
              {/* Editorial Teaser Text Preview with Fade Overlay */}
              {article.excerpt && (
                <div className="relative font-serif text-lg sm:text-xl text-foreground/80 leading-relaxed max-w-none">
                  <p className="line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                </div>
              )}

              <ArticleLock />
            </div>
          ) : (
            <SanitizedContent
              html={article.content}
              className="prose prose-lg sm:prose-xl dark:prose-invert max-w-none 
              font-serif text-foreground/90 leading-[1.85] article-content
              prose-headings:font-sans prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
              prose-p:leading-[1.85] prose-p:mb-6 prose-p:text-foreground/90
              prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:py-1 prose-blockquote:italic prose-blockquote:text-foreground/90 prose-blockquote:font-serif
              prose-img:rounded-2xl prose-img:shadow-md prose-img:my-8
              prose-li:marker:text-primary"
            />
          )}

          {/* Tags */}
          {Array.isArray(article.tags) && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {article.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/articles?q=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Inline Ad */}
          {/* <AdSlot slot="article-inline" width={728} height={90} className="mx-auto my-8" /> */}

          {/* Videos */}
          {!article.isSubscriberOnly && !(article as any).locked && Array.isArray(article.videos) && article.videos.length > 0 && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 border-t pt-8">
              {prev ? (
                <Link href={`/articles/${prev.slug}`} className="group flex flex-col p-4 rounded-lg border hover:bg-muted/50 transition">
                  <span className="text-sm text-muted-foreground mb-1">← Previous Article</span>
                  <span className="font-medium group-hover:text-primary line-clamp-2">{prev.title}</span>
                </Link>
              ) : <div />}
              {next ? (
                <Link href={`/articles/${next.slug}`} className="group flex flex-col items-end text-right p-4 rounded-lg border hover:bg-muted/50 transition">
                  <span className="text-sm text-muted-foreground mb-1">Next Article →</span>
                  <span className="font-medium group-hover:text-primary line-clamp-2">{next.title}</span>
                </Link>
              ) : <div />}
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-16 bg-muted/30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-12">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {relatedArticles.map((related: Article) => (
                    <Link
                      key={related.id}
                      href={`/articles/${related.slug}`}
                      className="group flex flex-col bg-card rounded-xl border shadow-sm hover:shadow-md transition overflow-hidden"
                    >
                      {related.coverImage && (
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          <Image
                            src={related.coverImage.startsWith('http') ? related.coverImage : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${related.coverImage.startsWith('/') ? '' : '/'}${related.coverImage}`}
                            alt={related.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover group-hover:scale-105 transition duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="text-lg font-bold group-hover:text-primary leading-snug mb-2 line-clamp-2">
                          {related.title}
                        </h3>
                        {related.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                            {related.excerpt}
                          </p>
                        )}
                        <div className="text-xs text-muted-foreground font-medium pt-2 border-t mt-auto">
                          Read article →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
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
