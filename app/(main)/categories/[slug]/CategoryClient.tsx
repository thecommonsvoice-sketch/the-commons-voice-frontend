"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Article, Category } from "@/lib/types";
import { api } from "@/lib/api";
import { Search, MessageSquare, Bookmark, BookmarkCheck } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";
import { CommentsSidebar } from "@/components/CommentSidebar";

function optimizeImageUrl(url: string | undefined | null, width = 600): string {
  if (!url) return "/placeholder.jpg";
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
  }
  return url;
}

export default function CategoryClient({
  category,
  initialArticles,
  initialPagination,
}: {
  category: Category;
  initialArticles: Article[];
  initialPagination: { total: number; totalPages: number };
}) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [pagination, setPagination] = useState(initialPagination);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>("all");
  const [activeArticleForComments, setActiveArticleForComments] = useState<string | null>(null);
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialArticles.forEach((a) => {
      if (a.isBookmarked) map[a.id] = true;
    });
    return map;
  });

  const { user } = useUserStore();

  const fetchArticles = async (searchTerm: string, pageNum: number) => {
    setLoading(true);
    try {
      const res = await api.get("/articles", {
        params: {
          category: category.slug,
          search: searchTerm,
          page: pageNum,
          limit: 9,
        },
      });
      setArticles(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchArticles(search, 1);
  };

  const handlePagination = (pageNum: number) => {
    setPage(pageNum);
    fetchArticles(search, pageNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleBookmark = async (e: React.MouseEvent, articleId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Sign in to bookmark dispatches to your portfolio");
      return;
    }

    const currentStatus = !!bookmarkedMap[articleId];
    try {
      if (currentStatus) {
        await api.delete("bookmarks", { data: { articleId } });
        setBookmarkedMap((prev) => ({ ...prev, [articleId]: false }));
        toast.success("Dispatch removed from archives");
      } else {
        await api.post("bookmarks", { articleId });
        setBookmarkedMap((prev) => ({ ...prev, [articleId]: true }));
        toast.success("Dispatch archived to your folio");
      }
    } catch {
      toast.error("Action could not be recorded");
    }
  };

  const sampleSubtopics = [
    { label: `#All ${category.name}`, id: "all" },
    { label: "#Field Investigations", id: "investigations" },
    { label: "#Statecraft & Policy", id: "policy" },
    { label: "#Regional Economy", id: "economy" },
    { label: "#Public Record", id: "record" },
  ];

  return (
    <div className="w-full bg-[#FAF7F2] text-[#1A1715] min-h-screen">
      <div className="max-w-[1380px] mx-auto px-3 sm:px-6 md:px-8 py-6 sm:py-8">
        {/* ARCHIVE BREADCRUMB & METADATA */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[#E2D9CE] pb-3 text-xs font-sans text-[#68635D]">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#1A1715]">
              Home
            </Link>
            <span className="text-[#D1C4B5]">/</span>
            <Link href="/categories" className="hover:text-[#1A1715]">
              Categories
            </Link>
            <span className="text-[#D1C4B5]">/</span>
            <span className="font-bold text-[#1A1715] uppercase">{category.name}</span>
          </div>
          <div className="text-[11px] font-sans text-[#68635D]">
            The Commons Voice Editorial Archive
          </div>
        </div>

        {/* BEAT HUB HEADER */}
        <div className="py-6 sm:py-8 border-b-2 border-[#1A1715] space-y-2">
          <span className="inline-block px-2 py-0.5 bg-[#1A1715] text-[#FAF7F2] font-sans text-[10px] font-extrabold uppercase tracking-widest">
            Comprehensive Beat Hub
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1715] tracking-tight">
            {category.name} News &amp; Regional Dispatches
          </h1>
          <p className="font-serif text-sm sm:text-base text-[#3C3835] max-w-3xl leading-relaxed pt-1">
            {category.description ||
              "Comprehensive field investigations, state governance, ecological alerts, and frontline reporting recorded across regional bureaus and diplomatic desks."}
          </p>
        </div>

        {/* BEAT SUB-FILTERS & SEARCH BAR */}
        <div className="py-4 border-b border-[#E2D9CE] flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs">
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68635D] mr-1 shrink-0">
              Beat Filters:
            </span>
            {sampleSubtopics.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubtopic(sub.id)}
                className={`px-2.5 py-1 text-[11px] font-medium transition-colors border ${
                  selectedSubtopic === sub.id
                    ? "bg-[#1A1715] text-[#FAF7F2] border-[#1A1715] font-bold"
                    : "bg-[#F5EFEB] hover:bg-[#ECE4DB] text-[#3C3835] border-[#E2D9CE]"
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#68635D]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={`Search ${category.name} archives...`}
                className="w-full pl-8 pr-12 py-1 text-xs font-sans bg-[#F5EFEB] border border-[#E2D9CE] text-[#1A1715] placeholder-[#68635D] focus:outline-none focus:border-[#1A1715] rounded-none"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-sans font-bold bg-[#1A1715] text-[#FAF7F2] px-1.5 py-0.5"
              >
                Go
              </button>
            </div>
          </div>
        </div>

        {/* SECTION HEADER: FIELD DISPATCHES */}
        <div className="pt-6 pb-4 flex items-center justify-between border-b border-[#D1C4B5] mb-6">
          <div className="flex items-center gap-2 font-headline font-bold text-lg sm:text-xl text-[#1A1715]">
            <span>LATEST DISPATCHES &amp; REPORTS</span>
          </div>
          <div className="font-sans text-[11px] text-[#68635D] font-bold uppercase tracking-wider">
            Page {page} of {pagination.totalPages || 1}
          </div>
        </div>

        {/* ARTICLES 3-COLUMN BROADSHEET GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse py-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 bg-[#F3EDE5] border border-[#E2D9CE]" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {articles.map((article) => {
              const dateStr = article.publishedAt || article.createdAt;
              const timeAgo = dateStr
                ? formatDistanceToNow(new Date(dateStr), { addSuffix: true })
                : "recent";
              const isBookmarked = !!bookmarkedMap[article.id];

              return (
                <article
                  key={article.id}
                  className="group flex flex-col justify-between bg-[#FAF7F2] border border-[#E2D9CE] hover:border-[#1A1715] transition-all duration-300"
                >
                  <div>
                    {/* Photograph Container */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#F3EDE5] border-b border-[#E2D9CE]">
                      <Link href={`/articles/${article.slug}`}>
                        <img
                          src={optimizeImageUrl(article.coverImage, 600)}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                        />
                      </Link>
                      <span className="absolute top-2.5 left-2.5 font-sans font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[#1A1715] text-[#FAF7F2]">
                        {article.category?.name || category.name}
                      </span>
                    </div>

                    <div className="p-4 sm:p-5 space-y-2.5">
                      <div className="flex items-center gap-2 font-sans text-[10px] uppercase font-bold tracking-widest text-[#C2410C]">
                        <span>Regional Desk</span>
                        <span className="text-[#D1C4B5]">•</span>
                        <span className="text-[#68635D]">Official Record</span>
                      </div>

                      <Link href={`/articles/${article.slug}`} className="block">
                        <h3 className="font-headline text-lg sm:text-xl font-bold text-[#1A1715] leading-snug group-hover:text-[#C2410C] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                      </Link>

                      {article.excerpt && (
                        <p className="font-serif text-xs sm:text-sm text-[#3C3835] leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 pt-0 mt-auto">
                    <div className="flex items-center justify-between pt-3 border-t border-[#E2D9CE] font-sans text-[11px] text-[#68635D]">
                      <span className="truncate max-w-[120px] font-semibold text-[#1A1715]">
                        {article.author?.name || "The Commons Voice"}
                      </span>
                      <span>•</span>
                      <span>{timeAgo}</span>
                      <div className="ml-auto flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setActiveArticleForComments(article.id)}
                          className="hover:text-[#1A1715] cursor-pointer"
                          title="View comments"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleBookmark(e, article.id)}
                          className={`hover:text-[#C2410C] transition-colors ${
                            isBookmarked ? "text-[#C2410C]" : "text-[#68635D]"
                          }`}
                          title={isBookmarked ? "Remove from folio" : "Archive dispatch"}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border border-[#E2D9CE] bg-[#F5EFEB] text-[#68635D] font-serif">
            <p className="text-base">No field dispatches recorded under this inquiry.</p>
            <button
              onClick={() => {
                setSearch("");
                fetchArticles("", 1);
              }}
              className="mt-3 text-xs font-sans font-bold uppercase tracking-wider text-[#C2410C] hover:underline"
            >
              Reset Archive Search
            </button>
          </div>
        )}

        {/* FOLIO PAGINATION BAR */}
        {pagination.totalPages > 1 && (
          <div className="mt-10 pt-4 border-t-2 border-[#1A1715] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs">
            <span className="text-[#68635D] font-serif italic text-xs">
              Showing Folio {page} of {pagination.totalPages} ({pagination.total} articles on file)
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => handlePagination(page - 1)}
                className="px-3 py-1.5 border border-[#E2D9CE] bg-[#F5EFEB] hover:bg-[#ECE4DB] disabled:opacity-40 text-[#1A1715] font-semibold text-[11px] uppercase tracking-wider"
              >
                Previous Folio
              </button>

              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePagination(pageNum)}
                    className={`w-8 h-7 text-[11px] font-bold border ${
                      isCurrent
                        ? "bg-[#1A1715] text-[#FAF7F2] border-[#1A1715]"
                        : "bg-[#F5EFEB] text-[#1A1715] border-[#E2D9CE] hover:bg-[#ECE4DB]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => handlePagination(page + 1)}
                className="px-3 py-1.5 border border-[#E2D9CE] bg-[#F5EFEB] hover:bg-[#ECE4DB] disabled:opacity-40 text-[#1A1715] font-semibold text-[11px] uppercase tracking-wider"
              >
                Next Page
              </button>
            </div>
          </div>
        )}

        {/* THE BEAT MORNING BRIEFING TELEGRAM CARD */}
        <div className="mt-12 bg-[#1A1715] text-[#FAF7F2] p-8 sm:p-10 border border-[#3C3835] text-center max-w-3xl mx-auto space-y-4">
          <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#C2410C] block">
            Newsroom Telegram Dispatch
          </span>
          <h3 className="font-headline text-2xl sm:text-3xl font-bold">
            The {category.name} Beat Morning Briefing
          </h3>
          <p className="font-serif text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
            Receive our daily editorial summary of regional developments, municipal proceedings, and verified investigative records delivered at 06:00 GMT.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2"
          >
            <input
              type="email"
              placeholder="correspondent@organization.com"
              className="w-full sm:w-72 bg-[#2C2A29] border border-[#3C3835] px-3 py-2 text-xs font-sans text-white placeholder-stone-400 focus:outline-none focus:border-[#FAF7F2]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#C2410C] hover:bg-[#9A3412] text-white font-sans text-xs font-bold uppercase tracking-widest px-4 py-2 transition-colors shrink-0"
            >
              Subscribe Complimentary
            </button>
          </form>

          <p className="font-sans text-[10px] text-stone-400 pt-1">
            🔒 Strict editorial confidentiality • No syndication spam • One-click cancellation
          </p>
        </div>
      </div>

      {activeArticleForComments && (
        <CommentsSidebar
          articleId={activeArticleForComments}
          onClose={() => setActiveArticleForComments(null)}
        />
      )}
    </div>
  );
}
