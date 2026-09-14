import type { Metadata } from "next";
import Link from "next/link";
import { BentoGridHero } from "@/components/BentoGridHero";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/loading-skeleton";
import type { Article, Category } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BreakingNewsTicker } from "@/components/BreakingNewsTicker";
import { RecommendedWidget } from "@/components/RecommendedWidget";
import { LeftPortalNav } from "@/components/LeftPortalNav";
import { ScrollReveal } from "@/components/ScrollReveal";

// Homepage metadata - optimized for SEO
export const metadata: Metadata = {
  title: "The Commons Voice - Independent News & Analysis",
  description: "The Commons Voice delivers independent news, in-depth analysis, and expert coverage of politics, business, health, lifestyle, sports, and entertainment. Your trusted source for breaking news and investigative journalism.",
  keywords: [
    "the commons voice",
    "thecommonsvoice",
    "the common voice",
    "commons voice news",
    "independent news",
    "breaking news",
    "news analysis",
    "investigative journalism"
  ],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
  },
  openGraph: {
    title: "The Commons Voice - Independent News & Analysis",
    description: "Your trusted source for independent news, breaking stories, and in-depth analysis from The Commons Voice.",
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "The Commons Voice",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "The Commons Voice - Independent News",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Commons Voice - Independent News & Analysis",
    description: "Your trusted source for independent news and analysis",
    site: "@TheCommonsVoice",
    creator: "@TheCommonsVoice",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/twitter-image.jpg`],
  },
};

// ISR Configuration
export const revalidate = 60; // Revalidate every 60 seconds

async function getArticles(): Promise<Article[]> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/articles?limit=20`, {
      next: { revalidate: 60 },  // ISR caching
      headers: {
        Cookie: cookieHeader
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/categories`, {
      next: { revalidate: 60 }  // Reduced from 600 to 60 seconds
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.categories) ? data.categories : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [articles, categories] = await Promise.all([getArticles(), getCategories()]);

  // Only show public published articles (exclude subscriber-only)
  const publishedArticles = articles.filter(a => a.status === "PUBLISHED" && !a.isSubscriberOnly);
  const featuredArticles = publishedArticles.slice(0, 5);
  const recentArticles = publishedArticles.slice(5, 17);
  const trendingCategories = categories.filter(c => c.isActive).slice(0, 6);

  const recommendedItems = publishedArticles.slice(0, 5).map(article => ({
    title: article.title,
    link: `/articles/${article.slug}`,
    image: article.coverImage ?? "/placeholder.jpg"
  }));

  // Structured data for Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Commons Voice",
    alternateName: ["TheCommonsVoice", "The Common Voice", "Commons Voice"],
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    description: "Independent news, analysis, and reporting from around the world. Your trusted source for breaking news and investigative journalism.",
    sameAs: [
      "https://twitter.com/TheCommonsVoice",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "General Support",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/contact`,
    },
  };

  // Structured data for NewsCollection (BreadcrumbList alternative)
  const newsCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: "The Commons Voice",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    masthead: `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
    correctionsPolicy: `${process.env.NEXT_PUBLIC_SITE_URL}/about`,
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsCollectionSchema) }}
      />

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 bg-grid-pattern rounded-3xl">
        <h1 className="sr-only">The Commons Voice - Independent News & Analysis</h1>
        {/* Breaking news ticker */}
        <BreakingNewsTicker />

        {/* Dynamic Topic Hashtags Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          <span className="text-slate-500 uppercase tracking-wider text-[11px] shrink-0 font-bold">Trending Topics:</span>
          {trendingCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="shrink-0 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-primary hover:text-white dark:hover:bg-primary transition-all duration-200 shadow-2xs"
            >
              #{cat.name}
            </Link>
          ))}
        </div>

        {/* Bento Grid Hero */}
        {featuredArticles.length > 0 && (
          <ScrollReveal direction="up" delay={0.1}>
            <BentoGridHero articles={featuredArticles} />
          </ScrollReveal>
        )}

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6">

          {/* Left Sidebar */}
          <aside className="hidden md:block md:col-span-3 space-y-6">
            <div className="sticky top-24">
              <LeftPortalNav />
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-9 lg:col-span-6 space-y-6 sm:space-y-8 order-2 md:order-2">
            <ScrollReveal direction="up" delay={0.15}>
              {/* Mobile/Tablet Trending */}
              <div className="lg:hidden space-y-4 mb-6 bg-card p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-primary rounded-full" />
                  Trending Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {trendingCategories.map((category) => (
                    <Link key={category.id} href={`/categories/${category.slug}`}>
                      <Badge
                        variant="secondary"
                        className="hover:bg-primary hover:text-white transition-colors"
                      >
                        {category.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              <section>
                <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full" />
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
                      Latest News & Coverage
                    </h2>
                  </div>
                  <Link href="/articles" className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                    View all <span>&rarr;</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {recentArticles.length > 0 ? (
                    recentArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} variant="horizontal" />
                    ))
                  ) : (
                    Array.from({ length: 6 }).map((_, i) => (
                      <Card key={i}>
                        <Skeleton className="h-48 bg-gray-200 dark:bg-gray-800" />
                        <CardContent className="p-4 space-y-2">
                          <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800" />
                          <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800" />
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </section>
            </ScrollReveal>
          </main>

          {/* Right Sidebar */}
          <aside className="block md:hidden lg:block lg:col-span-3 space-y-8 order-3 md:order-3">
            <ScrollReveal direction="up" delay={0.2}>
              <div className="sticky top-24 space-y-8">
                <div className="hidden lg:block space-y-4 bg-card p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-primary rounded-full" />
                    Trending Topics
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {trendingCategories.map((category) => (
                      <Link key={category.id} href={`/categories/${category.slug}`}>
                        <Badge
                          variant="secondary"
                          className="hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                          {category.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>

                <RecommendedWidget items={recommendedItems} />

                <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-3">
                  <h2 className="text-base font-bold font-serif text-white flex items-center gap-2">
                    <span>📬</span> Newsroom Digest
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Get top breaking stories and analytical briefings delivered directly to your inbox every morning.
                  </p>
                  <div className="space-y-2 pt-1">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-3 py-2 text-xs border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button className="w-full bg-primary text-white px-3 py-2 text-xs rounded-lg hover:bg-primary/90 transition-colors font-semibold shadow-xs">
                      Join Free
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </aside>
        </div>
      </div>
    </>
  );
}
