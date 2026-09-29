import type { Metadata } from "next";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Article, Category } from "@/lib/types";
import { BreakingNewsTicker } from "@/components/BreakingNewsTicker";
import { DailyChronicleFeed } from "@/components/DailyChronicleFeed";
import { MorningDispatchForm } from "@/components/MorningDispatchForm";
import { LiveCurrencyBox } from "@/components/LiveCurrencyTicker";
import { Bookmark, MessageSquare, Share2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "The Commons Voice - The Independent International Broadsheet of Record",
  description:
    "The Commons Voice delivers independent news, in-depth analysis, and expert coverage across world affairs, politics, business, science, and cultural criticism.",
  keywords: [
    "the commons voice",
    "broadsheet of record",
    "independent journalism",
    "world dispatches",
    "investigative reporting",
  ],
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

export const revalidate = 60; // Revalidate every 60 seconds

async function getArticles(): Promise<Article[]> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
    const res = await fetch(`${base}/articles?limit=25`, {
      next: { revalidate: 60 },
      headers: {
        Cookie: cookieHeader,
      },
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
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.categories) ? data.categories : [];
  } catch {
    return [];
  }
}

function optimizeImageUrl(url: string | undefined | null, width = 800): string {
  if (!url) return "/placeholder.jpg";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

function getArticleSummary(article: Article, maxLength = 160): string {
  if (article.excerpt && article.excerpt.trim().length > 0) {
    return article.excerpt.trim();
  }
  if (article.content) {
    const clean = article.content
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (clean.length > maxLength) {
      return clean.slice(0, maxLength).trim() + "…";
    }
    return clean;
  }
  return "Verified dispatches and field reporting recorded across regional bureaus.";
}

function getLeadParagraphs(leadArticle: Article | null): { first: string; second: string } {
  if (!leadArticle) {
    return {
      first: "Senior diplomats and international observers have convened to review newly finalized multilateral treaties and strategic economic accords.",
      second: "Addressing foreign correspondents, senior diplomatic figures stated that bilateral corridors represent essential anchors for continental stability and resilient market ties.",
    };
  }

  // Convert HTML paragraphs into clean text blocks
  const html = leadArticle.content || "";
  const cleaned = html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n\n")
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Split into sentences
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);

  if (sentences.length >= 4) {
    const first = sentences.slice(0, 2).join(" ");
    const second = sentences.slice(2, 4).join(" ");
    return { first, second };
  }

  if (cleaned.length > 0) {
    const half = Math.min(280, Math.floor(cleaned.length / 2));
    const first = cleaned.slice(0, half).trim() + "…";
    const second = cleaned.slice(half, half * 2).trim() + "…";
    return { first, second };
  }

  const excerpt = leadArticle.excerpt || "";
  return {
    first: excerpt.slice(0, 250) || "Senior diplomats and international observers have convened to review newly finalized multilateral treaties.",
    second: excerpt.slice(250, 500) || "Addressing foreign correspondents, delegations highlighted cross-border infrastructure and commercial stability.",
  };
}

export default async function HomePage() {
  const [articles, categories] = await Promise.all([getArticles(), getCategories()]);

  const publishedArticles = articles.filter(
    (a) => a.status === "PUBLISHED" && !a.isSubscriberOnly
  );

  const leadArticle = publishedArticles[0] || null;
  const secondaryArticles = publishedArticles.slice(1, 3);
  const chronicleArticles =
    publishedArticles.length > 3
      ? publishedArticles.slice(3)
      : publishedArticles;
  const mostReadArticles = publishedArticles.slice(0, 5);
  const trendingCategories = categories.filter((c) => c.isActive).slice(0, 8);

  const { first: firstParagraph, second: secondParagraph } = getLeadParagraphs(leadArticle);

  const leadDateStr = leadArticle?.publishedAt || leadArticle?.createdAt;
  const leadTimeAgo = leadDateStr
    ? formatDistanceToNow(new Date(leadDateStr), { addSuffix: true })
    : "Verified Wire";

  const romanNumerals = ["I.", "II.", "III.", "IV.", "V."];

  return (
    <div className="w-full bg-[#FAF7F2] text-[#1A1715]">
      {/* 1. EDITORIAL BULLETIN / LIVE WIRE STRIP */}
      <BreakingNewsTicker />

      {/* 2. MAIN BROADSHEET BODY CONTAINER */}
      <main className="max-w-[1380px] mx-auto px-3 sm:px-6 md:px-8 py-5 sm:py-6">
        {/* TOPIC TAGS BAR (Newspaper Index Ribbon) */}
        <div className="pb-3.5 mb-6 border-b border-[#E2D9CE] flex flex-wrap items-center justify-between gap-y-2.5 font-sans text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-[#68635D] mr-1 shrink-0">
              Current Dossiers:
            </span>
            {trendingCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="px-2.5 py-1 bg-[#F5EFEB] border border-[#E2D9CE] hover:border-[#68635D] hover:bg-[#ECE4DB] transition-colors text-[#1A1715] text-[11px] font-medium"
              >
                #{cat.name}
              </Link>
            ))}
          </div>
          <div className="text-[11px] text-[#68635D] italic font-serif hidden sm:block">
            Independent Digital Edition · Verified Global Dispatches
          </div>
        </div>

        {/* PRIMARY EDITORIAL SPREAD */}
        {leadArticle && (
          <section className="grid grid-cols-12 gap-8 pb-8 border-b-2 border-[#D1C4B5]">
            {/* LEAD STORY (Left 8 Columns) */}
            <article className="col-span-12 lg:col-span-8 flex flex-col justify-between pr-0 lg:pr-8 border-b lg:border-b-0 lg:border-r border-[#E2D9CE] pb-8 lg:pb-0">
              <div>
                {/* Lead Kicker */}
                <div className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-widest text-[#C2410C] mb-2 flex-wrap">
                  <span>Special Report</span>
                  <span className="text-[#D1C4B5]">•</span>
                  <span className="text-[#68635D]">
                    {leadArticle.category?.name || "Diplomatic Cable"}
                  </span>
                  <span className="text-[#D1C4B5]">•</span>
                  <span className="text-[#68635D]">Lead Wire</span>
                </div>

                {/* Main Headline */}
                <Link href={`/articles/${leadArticle.slug}`} className="group block">
                  <h2 className="font-headline text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#1A1715] leading-[1.12] tracking-tight group-hover:text-[#C2410C] transition-colors">
                    {leadArticle.title}
                  </h2>
                </Link>

                {/* Byline Bar */}
                <div className="flex items-center gap-3 my-3 py-2 border-y border-[#E2D9CE] font-sans text-xs text-[#68635D] flex-wrap">
                  <span className="font-bold text-[#1A1715]">
                    By {leadArticle.author?.name || "The Commons Voice Staff"}
                  </span>
                  <span className="text-[#D1C4B5]">•</span>
                  <span>Published {leadTimeAgo}</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[#68635D]">
                    <span className="w-2 h-2 rounded-full bg-[#C2410C]" /> Verified Wire
                  </span>
                </div>

                {/* Lead Hero Image */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-[#F3EDE5] border border-[#E2D9CE] my-4">
                  <Link href={`/articles/${leadArticle.slug}`}>
                    <img
                      src={optimizeImageUrl(leadArticle.coverImage, 1200)}
                      alt={leadArticle.title}
                      className="w-full h-full object-cover filter contrast-[1.02]"
                    />
                  </Link>
                </div>

                <p className="font-sans text-[11px] text-[#68635D] italic border-b border-[#E2D9CE] pb-2 mb-4">
                  Lead Dispatch: {leadArticle.title}
                </p>

                {/* Lead Editorial Paragraphs with Dropcap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px] leading-relaxed text-[#3C3835]">
                  <p className="newspaper-dropcap">{firstParagraph}</p>
                  <p>{secondParagraph}</p>
                </div>
              </div>

              {/* Footnote Actions */}
              <div className="flex items-center justify-between pt-4 mt-6 border-t border-[#E2D9CE] font-sans text-xs text-[#68635D]">
                <div className="flex items-center gap-4">
                  <Link
                    href={`/articles/${leadArticle.slug}`}
                    className="flex items-center gap-1.5 hover:text-[#1A1715]"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Reader Discussion</span>
                  </Link>
                  <span className="text-[#D1C4B5]">|</span>
                  <Link
                    href={`/articles/${leadArticle.slug}`}
                    className="flex items-center gap-1.5 hover:text-[#1A1715]"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </Link>
                </div>
                <Link
                  href={`/articles/${leadArticle.slug}`}
                  className="font-bold text-[#C2410C] hover:underline flex items-center gap-1 uppercase tracking-wider text-[11px]"
                >
                  Full Dispatch <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>

            {/* SECONDARY STORIES (Right 4 Columns) */}
            <div className="col-span-12 lg:col-span-4 flex flex-col justify-start space-y-6">
              {secondaryArticles.map((article, idx) => {
                const articleDate = article.publishedAt || article.createdAt;
                const timeAgo = articleDate
                  ? formatDistanceToNow(new Date(articleDate), { addSuffix: true })
                  : "recently";

                return (
                  <article
                    key={article.id}
                    className={`flex flex-col group ${
                      idx > 0 ? "pt-8 border-t border-[#E2D9CE]" : ""
                    }`}
                  >
                    <div className="aspect-[16/9] w-full overflow-hidden bg-[#F3EDE5] border border-[#E2D9CE] mb-3">
                      <Link href={`/articles/${article.slug}`}>
                        <img
                          src={optimizeImageUrl(article.coverImage, 600)}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-widest text-[#C2410C] mb-1">
                      <span>{article.category?.name || "General Wire"}</span>
                      <span className="text-[#D1C4B5]">•</span>
                      <span className="text-[#68635D]">Desk Dispatch</span>
                    </div>

                    <Link href={`/articles/${article.slug}`}>
                      <h3 className="font-headline text-xl sm:text-2xl font-bold text-[#1A1715] leading-snug group-hover:text-[#C2410C] transition-colors">
                        {article.title}
                      </h3>
                    </Link>

                    <p className="font-serif text-sm text-[#68635D] leading-normal mt-2 line-clamp-2">
                      {getArticleSummary(article)}
                    </p>

                    <div className="flex items-center justify-between font-sans text-[11px] text-[#68635D] mt-3 pt-2 border-t border-[#F3EDE5]">
                      <span>
                        {timeAgo} • {article.author?.name || "Editorial Desk"}
                      </span>
                      <Link href={`/articles/${article.slug}`} className="hover:text-[#1A1715]">
                        <Bookmark className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION TWO: CHRONICLE FEED (Full 100% Width) */}
        <section className="pt-8">
          <DailyChronicleFeed
            initialArticles={chronicleArticles}
            categories={categories}
          />
        </section>

        {/* SECTION THREE: EDITORIAL INTELLIGENCE TRIO (Most Read + Morning Dispatch + Live Currency Wire) */}
        <section className="pt-10 pb-6 border-t-[3px] border-[#1A1715] border-double mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. THE BROADSHEET INDEX (Top 5 Reads) */}
            <div className="bg-[#F4EFEA] p-5 sm:p-6 border border-[#DFD6C9]">
              <div className="flex items-center justify-between border-b border-[#D1C4B5] pb-2 mb-4">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-widest font-extrabold text-[#C2410C] block">
                    Essential Index
                  </span>
                  <h4 className="font-headline text-xl font-bold text-[#1A1715]">
                    Most Read Dispatches
                  </h4>
                </div>
                <span className="font-serif italic text-xs text-[#68635D]">24 Hours</span>
              </div>

              <div className="flex flex-col divide-y divide-[#E2D9CE]">
                {mostReadArticles.map((item, idx) => (
                  <Link
                    key={item.id}
                    href={`/articles/${item.slug}`}
                    className="py-3 first:pt-0 group flex items-start gap-3"
                  >
                    <span className="font-headline text-2xl font-bold text-[#68635D] group-hover:text-[#C2410C] transition-colors leading-none w-6 shrink-0">
                      {romanNumerals[idx] || `${idx + 1}.`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-sans text-[9px] uppercase tracking-wider font-bold text-[#C2410C] block mb-0.5">
                        {item.category?.name || "Diplomacy"}
                      </span>
                      <h5 className="font-headline text-[14px] sm:text-[15px] font-bold text-[#1A1715] group-hover:text-[#C2410C] transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h5>
                      <span className="font-sans text-[10px] text-[#68635D] mt-1 block">
                        {item.publishedAt
                          ? formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })
                          : "Verified Wire"}
                      </span>
                    </div>
                    {item.coverImage && (
                      <div className="w-16 h-12 aspect-[4/3] overflow-hidden border border-[#E2D9CE] shrink-0 bg-[#F3EDE5]">
                        <img
                          src={optimizeImageUrl(item.coverImage, 160)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* 2. THE MORNING DISPATCH (TELEGRAM NEWSLETTER BOX) */}
            <div className="bg-[#F4EFEA] p-6 border border-[#DFD6C9] text-center space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#C2410C] block">
                    Newsroom Telegram
                  </span>
                  <h4 className="font-headline text-2xl font-bold text-[#1A1715]">
                    The Morning Dispatch
                  </h4>
                  <p className="font-sans text-[11px] text-[#68635D]">
                    Delivered daily at 06:00 GMT
                  </p>
                </div>

                <p className="font-serif text-xs text-[#3C3835] leading-relaxed">
                  Essential geopolitical briefings, market intelligence, and verified investigatory scoops directly from foreign correspondents.
                </p>

                <MorningDispatchForm />
              </div>

              <p className="font-sans text-[10px] text-[#68635D] flex items-center justify-center gap-1 pt-1 border-t border-[#DFD6C9]">
                <span>🔒 Strict editorial confidentiality • No syndication spam</span>
              </p>
            </div>

            {/* 3. REAL-TIME LIVE FX CURRENCY RATES BOX */}
            <div className="flex flex-col justify-start">
              <LiveCurrencyBox />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
