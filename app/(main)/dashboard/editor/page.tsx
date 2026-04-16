"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Eye,
  Clock,
  Search,
  Trash2,
  TrendingUp,
  Newspaper,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import type { Article } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";

type ArticlesResponse = {
  data: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  updatedTodayCount: number;
};

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  DRAFT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  ARCHIVED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export default function EditorDashboard() {
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "EDITOR") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [articleLoading, setArticleLoading] = useState(true);
  const [articlePage, setArticlePage] = useState(1);
  const articleLimit = 8;
  const [articleSearch, setArticleSearch] = useState("");
  const [articleSearchInput, setArticleSearchInput] = useState("");
  const [articleTotalPages, setArticleTotalPages] = useState(1);
  const [articleCount, setArticleCount] = useState(0);
  const [publishedToday, setPublishedToday] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, [articlePage, articleSearch]);

  const fetchArticles = async () => {
    setArticleLoading(true);
    try {
      const { data }: { data: ArticlesResponse } = await api.get(
        `/articles?page=${articlePage}&limit=${articleLimit}&search=${encodeURIComponent(articleSearch)}`
      );
      setArticles(data?.data || []);
      setArticleTotalPages(data?.pagination?.totalPages || 1);
      setArticleCount(data?.pagination?.total || 0);
      setPublishedToday(data?.updatedTodayCount || 0);
    } catch {
      toast.error("Failed to load articles");
    } finally {
      setArticleLoading(false);
    }
  };

  const handleArticleSearch = () => {
    setArticlePage(1);
    setArticleSearch(articleSearchInput.trim());
  };

  useEffect(() => {
    if (articleSearchInput === "") {
      setArticleSearch("");
      setArticlePage(1);
    }
  }, [articleSearchInput]);

  const updateArticleStatus = async (articleId: string, status: string) => {
    try {
      await api.patch(`/articles/status/${articleId}`, { status });
      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId
            ? { ...article, status: status as Article["status"] }
            : article
        )
      );
      toast.success("Article status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const deleteArticle = async (articleId: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await api.delete(`/articles/${articleId}`);
      setArticles((prev) => prev.filter((article) => article.id !== articleId));
      toast.success("Article deleted");
    } catch {
      toast.error("Failed to delete article");
    }
  };

  const reviewQueue = articles.filter((a) => a.status === "DRAFT");

  if (user && user.role !== "EDITOR") return null;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Editor Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review, edit, and manage articles from reporters.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <DashboardStatCard
          title="Pending Review"
          value={reviewQueue.length}
          subtitle="Articles awaiting approval"
          icon={Clock}
          accentColor="bg-amber-500/10 text-amber-600"
        />
        <DashboardStatCard
          title="Published Today"
          value={publishedToday}
          subtitle="New content today"
          icon={TrendingUp}
          accentColor="bg-emerald-500/10 text-emerald-600"
        />
        <DashboardStatCard
          title="Total Articles"
          value={articleCount}
          subtitle="All articles in system"
          icon={Newspaper}
          accentColor="bg-blue-500/10 text-blue-600"
        />
      </div>

      {/* Article Management */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-muted-foreground" />
            Article Management
          </CardTitle>
          <div className="flex items-center gap-2 mt-3">
            <Input
              placeholder="Search articles..."
              value={articleSearchInput}
              onChange={(e) => setArticleSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleArticleSearch()}
              className="max-w-xs h-9 text-sm"
            />
            <Button variant="outline" size="sm" onClick={handleArticleSearch} className="h-9">
              <Search className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {articleLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="space-y-2">
              {articles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-accent/30 transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{article.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        By {article.author?.name}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          STATUS_COLORS[article.status] || ""
                        }`}
                      >
                        {article.status}
                      </span>
                      {article.category && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {article.category.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                    <Select
                      value={article.status}
                      onValueChange={(status) =>
                        updateArticleStatus(article.id, status)
                      }
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button asChild size="sm" variant="ghost" className="h-8 px-2 text-xs">
                      <Link
                        href={`/articles/special-access/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteArticle(article.id)}
                      className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-between pt-3 border-t mt-3">
                <p className="text-xs text-muted-foreground">
                  Page {articlePage} of {articleTotalPages}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={articlePage <= 1}
                    onClick={() => setArticlePage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={articlePage >= articleTotalPages}
                    onClick={() => setArticlePage((p) => p + 1)}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No articles found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}