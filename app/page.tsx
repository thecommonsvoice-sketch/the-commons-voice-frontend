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

  // Only show published articles
  const publishedArticles = articles.filter(a => a.status === "PUBLISHED");
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

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Breaking news ticker */}
        <BreakingNewsTicker />

        {/* Bento Grid Hero */}
        {featuredArticles.length > 0 && <BentoGridHero articles={featuredArticles} />}

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

            {/* Mobile/Tablet Trending - Shown here because Right Sidebar is hidden on Tablet or pushed down on Mobile */}
            <div className="lg:hidden space-y-4 mb-6">
              <h3 className="text-lg font-bold font-serif border-l-4 border-primary pl-3">Trending</h3>
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
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-primary pb-2">
                  Latest News
                </h2>
                <Link href="/articles" className="text-xs sm:text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {recentArticles.length > 0 ? (
                  recentArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} variant="horizontal" />
                  ))
                ) : ( // ... skeletons
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
          </main>

          {/* Right Sidebar - Stacked on Mobile, Hidden on Tablet, Visible on Desktop */}
          <aside className="block md:hidden lg:block lg:col-span-3 space-y-8 order-3 md:order-3">
            <div className="sticky top-24 space-y-8">
              <div className="hidden lg:block space-y-4">
                <h3 className="text-lg font-bold font-serif border-l-4 border-primary pl-3">Trending</h3>
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

              <RecommendedWidget items={recommendedItems} />

              <div className="bg-muted/30 p-5 rounded-xl border border-border/50">
                <h3 className="text-lg font-bold font-serif mb-2">Subscribe</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest news delivered.
                </p>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                  />
                  <button className="w-full bg-primary text-primary-foreground px-3 py-2 text-sm rounded-md hover:bg-primary/90 transition-colors font-medium">
                    Join Now
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
