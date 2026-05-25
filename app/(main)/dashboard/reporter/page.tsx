"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import {
  FileText,
  Plus,
  TrendingUp,
  Clock,
  Newspaper,
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ArticlesResponse = {
  data: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  updatedTodayCount?: number;
  draftCount: number;
};

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  DRAFT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  ARCHIVED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export default function ReporterDashboard() {
  const { user } = useUserStore();
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleType, setArticleType] = useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">(
    "ALL"
  );
  const [publishedToday, setPublishedToday] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    if (user && user.role !== "REPORTER") {
      router.replace("/dashboard");
    }
  }, [user, router]);

   useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    const statusQuery = articleType !== "ALL" ? `&status=${articleType}` : "";
    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";
    
    api
      .get<ArticlesResponse>(
        `/articles?authorId=${user.id}&page=${page}&limit=${limit}${statusQuery}${searchQuery}`
      )
      .then((res) => {
        setArticles(res.data?.data || []);
        setTotalPages(res.data?.pagination?.totalPages || 1);
        setPublishedToday(res.data?.updatedTodayCount || 0);
        setDraftCount(res.data?.draftCount || 0);
      })
      .catch(() => {
        setArticles([]);
        setPublishedToday(0);
        setDraftCount(0);
      })
      .finally(() => setLoading(false));
  }, [user, page, articleType, search, limit]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  useEffect(() => {
    if (searchInput === "") {
      setSearch("");
      setPage(1);
    }
  }, [searchInput]);

  const refreshArticles = () => {
    if (!user) return;
    const statusQuery = articleType !== "ALL" ? `&status=${articleType}` : "";
    const searchQuery = search ? `&search=${encodeURIComponent(search)}` : "";
    
    api
      .get<ArticlesResponse>(
        `/articles?authorId=${user.id}&page=${page}&limit=${limit}${statusQuery}${searchQuery}`
      )
      .then((res) => {
        setArticles(res.data?.data || []);
        setPublishedToday(res.data?.updatedTodayCount || 0);
        setDraftCount(res.data?.draftCount || 0);
      })
      .catch(() => {
        setArticles([]);
      });
  };

  const handleBulkDelete = async () => {
    if (!selectedArticles.length) return;
    if (!confirm(`Are you sure you want to delete ${selectedArticles.length} articles?`)) return;

    try {
      await api.post("/articles/bulk-delete", { ids: selectedArticles });
      setSelectedArticles([]);
      refreshArticles();
    } catch {
      console.error("Failed to bulk delete articles");
    }
  };

  const toggleArticleSelection = (id: string) => {
    setSelectedArticles((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllArticles = () => {
    if (selectedArticles.length === filteredArticles.length && filteredArticles.length > 0) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map((a) => a.id));
    }
  };

  const selectArticlesByType = (status: Article["status"]) => {
    const ids = filteredArticles.filter(a => a.status === status).map(a => a.id);
    setSelectedArticles(ids);
  };

  const filteredArticles =
    articleType === "ALL"
      ? articles
      : articles.filter((a) => a.status === articleType);

  const filterTabs = ["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"] as const;

  if (user && user.role !== "REPORTER") return null;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Reporter Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Write, manage, and track your articles.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/articles/new" prefetch={false}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Article
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardStatCard
          title="Published Today"
          value={publishedToday}
          subtitle="Articles published today"
          icon={TrendingUp}
          accentColor="bg-emerald-500/10 text-emerald-600"
        />
        <DashboardStatCard
          title="Total Articles"
          value={articles.length}
          subtitle="Your articles"
          icon={Newspaper}
          accentColor="bg-blue-500/10 text-blue-600"
        />
        <DashboardStatCard
          title="Drafts"
          value={draftCount}
          subtitle="Pending review"
          icon={Clock}
          accentColor="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* Articles Card */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Your Articles
            </CardTitle>
            <div className="flex items-center gap-2">
                <div className="relative max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search your articles..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Select
                  value={limit.toString()}
                  onValueChange={(val) => {
                    setLimit(parseInt(val));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-20 h-8 text-xs bg-muted/50 border-none shadow-none focus:ring-1 focus:ring-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20 / pg</SelectItem>
                    <SelectItem value="50">50 / pg</SelectItem>
                    <SelectItem value="100">100 / pg</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 mt-3 bg-muted/50 rounded-lg p-1 w-fit">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setArticleType(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  articleType === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "ALL" ? "All" : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Bulk Actions Bar */}
          {filteredArticles.length > 0 && (
             <div className="flex flex-wrap items-center gap-3 mt-4 p-2.5 bg-muted/30 rounded-lg border border-border/50">
               <div className="flex items-center gap-2">
                 <Select onValueChange={(val) => {
                   if (val === "all") toggleSelectAllArticles();
                   else if (val === "none") setSelectedArticles([]);
                   else selectArticlesByType(val as Article["status"]);
                 }}>
                   <SelectTrigger className="w-8 h-8 p-0 border-none bg-transparent shadow-none focus:ring-0">
                     <input
                       type="checkbox"
                       className="h-4 w-4 rounded border-2 border-primary/30 text-primary focus:ring-primary accent-primary cursor-pointer pointer-events-none"
                       checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                       readOnly
                     />
                   </SelectTrigger>
                   <SelectContent align="start" className="text-xs">
                     <SelectItem value="all">Select All Page</SelectItem>
                     <SelectItem value="none">Select None</SelectItem>
                     <div className="h-px bg-border my-1" />
                     <SelectItem value="DRAFT">Select Drafts</SelectItem>
                     <SelectItem value="PUBLISHED">Select Published</SelectItem>
                     <SelectItem value="ARCHIVED">Select Archived</SelectItem>
                   </SelectContent>
                 </Select>
                 <span className="text-[11px] font-medium text-muted-foreground">
                   {selectedArticles.length} selected
                 </span>
               </div>
               
               {selectedArticles.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="flex items-center gap-2"
                 >
                   <div className="h-4 w-px bg-border mx-1" />
                   <Button
                     variant="destructive"
                     size="sm"
                     className="h-7 px-2.5 text-[10px] gap-1"
                     onClick={handleBulkDelete}
                   >
                     <Trash2 className="h-3 w-3" />
                     Delete
                   </Button>
                 </motion.div>
               )}
             </div>
           )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="space-y-2">
              {filteredArticles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="group flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-accent/30 transition-all duration-200"
                >
                  {/* Selection */}
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-2 border-primary/30 text-primary focus:ring-primary accent-primary cursor-pointer transition-all"
                    checked={selectedArticles.includes(article.id)}
                    onChange={() => toggleArticleSelection(article.id)}
                  />
                  {/* Thumbnail */}
                  {article.coverImage && (
                    <div className="relative h-12 w-20 rounded-md overflow-hidden ring-1 ring-border/50 shrink-0 bg-muted">
                      <Image
                        src={article.coverImage.startsWith('http') ? article.coverImage : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${article.coverImage.startsWith('/') ? '' : '/'}${article.coverImage}`}
                        alt={article.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                        onError={(e) => {
                          (e.target as any).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{article.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          STATUS_COLORS[article.status] || ""
                        }`}
                      >
                        {article.status}
                      </span>
                      {article.category && (
                        <span className="text-[10px] text-muted-foreground">
                          {article.category.name}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {(() => {
                          const articleDate = article.publishedAt || article.createdAt;
                          return articleDate ? new Date(articleDate).toLocaleDateString() : "";
                        })()}
                      </span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2.5 text-xs"
                    >
                      <Link
                        href={`/articles/special-access/${article.slug}`}
                        prefetch={false}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs"
                    >
                      <Link
                        href={`/articles/special-access/${article.slug}/edit`}
                        prefetch={false}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <p className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No articles found. Start writing your first article!
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/articles/new">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Create Article
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}