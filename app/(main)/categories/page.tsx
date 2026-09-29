import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Category, Article } from "@/lib/types";
import {
  ArrowRight,
  Newspaper,
  Globe,
  Landmark,
  Cpu,
  Trophy,
  TrendingUp,
  FileText,
  Mail,
  ShieldCheck,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Section Index & Editorial Desks | The Commons Voice",
  description:
    "Comprehensive departmental index of reporting desks, global correspondent beats, and investigative dossiers published by The Commons Voice.",
  alternates: {
    canonical: "/categories",
  },
};

export const revalidate = 60;

const DESK_ICONS: Record<string, any> = {
  general: Newspaper,
  politics: Landmark,
  "science-and-technology": Cpu,
  "sports-and-entertainment": Trophy,
  business: TrendingUp,
  world: Globe,
};

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  general:
    "Essential public interest reporting, civic affairs, cultural dispatches, and daily developing events recorded across our global desks.",
  politics:
    "In-depth investigation of governance, parliamentary legislation, diplomatic summits, electoral integrity, and state policy.",
  "science-and-technology":
    "Critical analysis of frontier computing, geopolitical technology competition, scientific discoveries, and biological innovation.",
  "sports-and-entertainment":
    "Dispatches on international athletic governance, premier sporting leagues, cultural arts, and cinema criticism.",
  business:
    "Sovereign market analysis, macroeconomic policy, energy security, international trade flows, and corporate accountability.",
  world:
    "Firsthand reporting from overseas correspondents covering bilateral diplomacy, territorial disputes, and multilateral alliances.",
};

async function getCategories(): Promise<Category[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/categories`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.categories) ? data.categories : [];
  } catch (error) {
    console.error("Error fetching categories for index:", error);
    return [];
  }
}

async function getRecentArticles(): Promise<Article[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/articles?limit=30`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : [];
  } catch (error) {
    console.error("Error fetching articles for index:", error);
    return [];
  }
}

export default async function CategoriesIndexPage() {
  const [categories, articles] = await Promise.all([
    getCategories(),
    getRecentArticles(),
  ]);

  // Group recent articles by category slug or category ID
  const articlesByCategory: Record<string, Article[]> = {};
  articles.forEach((art) => {
    const catSlug = art.category?.slug?.toLowerCase();
    const catId = art.categoryId;
    if (catSlug) {
      if (!articlesByCategory[catSlug]) articlesByCategory[catSlug] = [];
      articlesByCategory[catSlug].push(art);
    }
    if (catId) {
      if (!articlesByCategory[catId]) articlesByCategory[catId] = [];
      articlesByCategory[catId].push(art);
    }
  });

  const romanNumerals = ["I.", "II.", "III.", "IV.", "V.", "VI.", "VII.", "VIII."];

  return (
    <div className="w-full bg-[#FAF7F2] text-[#1A1715] min-h-screen">
      <main className="max-w-[1380px] mx-auto px-3 sm:px-6 md:px-8 py-6 sm:py-8">
        {/* 1. BREADCRUMBS & SECTION STRIP */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[#E2D9CE] pb-3 text-xs font-sans text-[#68635D]">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#1A1715] transition-colors">
              Home
            </Link>
            <span className="text-[#D1C4B5]">/</span>
            <span className="font-bold text-[#1A1715] uppercase tracking-wider">
              Section Index &amp; Editorial Desks
            </span>
          </div>
          <div className="text-[11px] font-sans text-[#68635D] hidden sm:block">
            The Commons Voice · Complete Broadsheet Directory
          </div>
        </div>

        {/* 2. SECTION INDEX MASTHEAD HEADER */}
        <div className="py-8 sm:py-10 border-b-2 border-[#1A1715] space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-block px-2.5 py-0.5 bg-[#1A1715] text-[#FAF7F2] font-sans text-[10px] font-extrabold uppercase tracking-widest">
              Broadsheet Directory
            </span>
            <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
              Editorial Desks of Record
            </span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1715] tracking-tight leading-tight">
            The Broadsheet Section Index
          </h1>

          <p className="font-serif text-base sm:text-lg text-[#3C3835] max-w-3xl leading-relaxed pt-1">
            An exhaustive index of our active editorial bureaus, specialized investigation desks,
            and subject dossiers. Every dispatch is filed under strict journalistic scrutiny and verified public record.
          </p>
        </div>

        {/* 3. EDITORIAL BEATS GRID */}
        <section className="pt-10 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, idx) => {
              const IconComponent = DESK_ICONS[cat.slug.toLowerCase()] || FileText;
              const catArticles =
                articlesByCategory[cat.slug.toLowerCase()] ||
                articlesByCategory[cat.id] ||
                [];
              const deskNumber = romanNumerals[idx] || `${idx + 1}.`;
              const description =
                cat.description?.trim() ||
                DEFAULT_DESCRIPTIONS[cat.slug.toLowerCase()] ||
                "Comprehensive reporting, investigative dossiers, and verified dispatches filed directly from field correspondents.";

              return (
                <div
                  key={cat.id}
                  className="bg-[#F8F4EE] border border-[#DFD6C9] p-6 flex flex-col justify-between hover:border-[#1A1715] transition-colors group"
                >
                  <div className="space-y-4">
                    {/* Header Row: Desk number and Icon */}
                    <div className="flex items-center justify-between border-b border-[#E2D9CE] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-headline text-xl font-bold text-[#68635D] group-hover:text-[#C2410C] transition-colors leading-none">
                          {deskNumber}
                        </span>
                        <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#C2410C]">
                          Desk
                        </span>
                      </div>
                      <div className="w-8 h-8 rounded-none border border-[#E2D9CE] bg-[#FAF7F2] flex items-center justify-center text-[#68635D] group-hover:text-[#1A1715] group-hover:border-[#1A1715] transition-colors">
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Desk Title */}
                    <div>
                      <Link href={`/categories/${cat.slug}`}>
                        <h2 className="font-headline text-2xl font-bold text-[#1A1715] group-hover:text-[#C2410C] transition-colors leading-snug">
                          {cat.name}
                        </h2>
                      </Link>
                      <p className="font-serif text-[13.5px] text-[#3C3835] mt-2 leading-relaxed">
                        {description}
                      </p>
                    </div>

                    {/* Subcategories / Topics if present */}
                    {cat.children && cat.children.length > 0 && (
                      <div className="pt-2">
                        <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-[#68635D] block mb-1.5">
                          Sub-Beats &amp; Dossiers:
                        </span>
                        <div className="flex flex-wrap gap-1.5 font-sans text-[11px]">
                          {cat.children.map((child) => (
                            <Link
                              key={child.id}
                              href={`/categories/${child.slug}`}
                              className="px-2 py-0.5 bg-[#FAF7F2] border border-[#E2D9CE] hover:border-[#1A1715] text-[#1A1715] text-[10.5px] font-medium transition-colors"
                            >
                              #{child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Headlines Filed Under this Desk */}
                    {catArticles.length > 0 && (
                      <div className="pt-3 border-t border-[#E2D9CE] space-y-2">
                        <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#68635D] block">
                          Latest Dispatches
                        </span>
                        <div className="space-y-2">
                          {catArticles.slice(0, 2).map((art) => {
                            const dateStr = art.publishedAt || art.createdAt;
                            const timeAgo = dateStr
                              ? formatDistanceToNow(new Date(dateStr), { addSuffix: true })
                              : "Recent";
                            return (
                              <Link
                                key={art.id}
                                href={`/articles/${art.slug}`}
                                className="block group/link"
                              >
                                <h3 className="font-headline text-[13.5px] font-bold text-[#1A1715] group-hover/link:text-[#C2410C] transition-colors leading-snug line-clamp-2">
                                  {art.title}
                                </h3>
                                <span className="font-sans text-[10px] text-[#68635D] mt-0.5 block">
                                  {timeAgo}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary Link Button */}
                  <div className="pt-5 mt-5 border-t border-[#E2D9CE]">
                    <Link
                      href={`/categories/${cat.slug}`}
                      className="inline-flex items-center justify-between w-full font-sans text-xs font-bold uppercase tracking-wider text-[#1A1715] group-hover:text-[#C2410C] transition-colors"
                    >
                      <span>Explore {cat.name} Desk</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. DISPATCH INQUIRIES & EDITORIAL CONTACT BANNER */}
        <section className="border-t-[3px] border-[#1A1715] border-double pt-8 pb-4">
          <div className="bg-[#F4EFEA] border border-[#DFD6C9] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
                <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#C2410C]">
                  Editorial Verification &amp; Press Desk
                </span>
              </div>
              <h2 className="font-headline text-2xl font-bold text-[#1A1715]">
                Submitting Investigative Dossiers or Field Communiqués?
              </h2>
              <p className="font-serif text-sm text-[#3C3835] leading-relaxed">
                The Commons Voice welcomes verified documents, whistle-blower reports, and press
                briefings. All dispatches undergo strict factual verification prior to publication.
              </p>
              <div className="flex items-center gap-2 font-sans text-xs text-[#1A1715] pt-1">
                <Mail className="w-3.5 h-3.5 text-[#C2410C]" />
                <span className="font-bold">Official Newsroom Inquiries:</span>
                <a
                  href="mailto:contact@thecommonsvoice.com"
                  className="font-medium underline hover:text-[#C2410C] transition-colors"
                >
                  contact@thecommonsvoice.com
                </a>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <Link
                href="/contact"
                className="px-6 py-3 bg-[#1A1715] text-[#FAF7F2] font-sans text-xs uppercase tracking-widest font-bold text-center hover:bg-[#C2410C] transition-colors"
              >
                Contact Editorial Desk
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-[#1A1715] text-[#1A1715] font-sans text-xs uppercase tracking-widest font-bold text-center hover:bg-[#EAE2D8] transition-colors"
              >
                Return to Front Page
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
