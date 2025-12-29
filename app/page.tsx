import type { Metadata } from "next";
import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
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
  title: "Independent News & Analysis - The Commons Voice",
  description: "Breaking news, in-depth analysis, and expert coverage of politics, business, health, lifestyle, and more. Independent journalism from The Commons Voice.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
  },
  openGraph: {
    title: "Independent News & Analysis - The Commons Voice",
    description: "Breaking news and in-depth analysis from The Commons Voice. Stay informed with our independent journalism.",
    type: "website",
    locale: "en_IN",
  },
};

async function getArticles(): Promise<Article[]> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/articles?limit=20`, {
      cache: "no-store",
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
      next: { revalidate: 600 }
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
    url: process.env.NEXT_PUBLIC_SITE_URL,
    logo: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    description: "Independent news, analysis, and reporting from around the world.",
    sameAs: [
      "https://twitter.com/TheCommonsVoice",
    ],
    contact: {
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

        {/* H1 - Main Hero Section with SEO intro */}
        <section className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-6 sm:p-8 border border-slate-200 dark:border-slate-700 mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
            Independent News & In-Depth Analysis
          </h1>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
            Welcome to The Commons Voice, your trusted source for independent journalism and comprehensive analysis. We cover breaking news, politics, business, health, lifestyle, and more with rigorous reporting and diverse perspectives. Stay informed with our expert coverage of the stories that matter most to you.
          </p>
          <div className="flex flex-wrap gap-3 text-sm sm:text-base">
            <Link
              href="/articles"
              className="inline-block bg-primary text-primary-foreground px-4 sm:px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
            >
              Explore All News
            </Link>
            <Link
              href="/about"
              className="inline-block bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 sm:px-6 py-2 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              About Us
            </Link>
          </div>
        </section>

        {/* Hero Carousel */}
        {featuredArticles.length > 0 && <HeroCarousel articles={featuredArticles} />}

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6">

          {/* Left Sidebar */}
          <aside className="md:col-span-3 space-y-6 order-1 md:order-1">
            <LeftPortalNav />
          </aside>

          {/* Main Content */}
          <main className="md:col-span-6 space-y-6 sm:space-y-8 order-2 md:order-2">
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-primary pb-2">
                  Latest News
                </h2>
                <Link href="/articles" className="text-xs sm:text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {recentArticles.length > 0 ? (
                  recentArticles.map((article) => <ArticleCard key={article.id} article={article} />)
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
          </main>

          {/* Right Sidebar */}
          <aside className="md:col-span-3 space-y-6 order-3 md:order-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {trendingCategories.map((category) => (
                  <Link key={category.id} href={`/categories/${category.slug}`} className="block">
                    <Badge
                      variant="outline"
                      className="w-full justify-start hover:bg-primary hover:text-black transition-colors text-xs sm:text-sm"
                    >
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <RecommendedWidget items={recommendedItems} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Stay Updated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                  Get the latest news delivered to your inbox.
                </p>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md"
                  />
                  <button className="w-full bg-primary text-primary-foreground px-3 py-2 text-xs sm:text-sm rounded-md hover:bg-primary/90 transition-colors">
                    Subscribe
                  </button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
