"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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

  useEffect(() => {
    if (user && user.role !== "REPORTER") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get<ArticlesResponse>(
        `/articles?author=${user.name}&authorId=${user.id}&limit=10`
      )
      .then((res) => {
        setArticles(res.data?.data || []);
        setPublishedToday(res.data?.updatedTodayCount || 0);
        setDraftCount(res.data?.draftCount || 0);
      })
      .catch(() => {
        setArticles([]);
        setPublishedToday(0);
      })
      .finally(() => setLoading(false));
  }, [user]);

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
                  {/* Thumbnail */}
                  {article.coverImage && (
                    <img
                      src={article.coverImage}
                      alt=""
                      className="h-12 w-20 object-cover rounded-md flex-shrink-0 ring-1 ring-border/50"
                    />
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
                        {article.createdAt
                          ? new Date(article.createdAt).toLocaleDateString()
                          : ""}
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