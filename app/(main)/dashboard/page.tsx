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
  Edit,
  Plus,
  Bookmark,
  MessageSquare,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type ArticlesResponse = {
  data: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  updatedTodayCount: number;
  draftCount: number;
};

type BookmarkItem = {
  id: string;
  articleId: string;
  article: {
    id: string;
    title: string;
    slug: string;
    coverImage?: string | null;
  };
};

type CommentItem = {
  id: string;
  content: string;
  createdAt: string;
  article: {
    id: string;
    title: string;
    slug: string;
  };
};

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  DRAFT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  ARCHIVED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export default function Dashboard() {
  const { user } = useUserStore();
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleType, setArticleType] = useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">("ALL");
  const [publishedToday, setPublishedToday] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<BookmarkItem[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [userComments, setUserComments] = useState<CommentItem[]>([]);

  const isWriter = user?.role === "REPORTER" || user?.role === "EDITOR" || user?.role === "ADMIN";

  useEffect(() => {
    if (!user || !isWriter) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .get<ArticlesResponse>(`/articles?author=${user.name}&limit=10`)
      .then((res) => {
        setUserArticles(res.data?.data || []);
        setPublishedToday(res.data?.updatedTodayCount || 0);
        setDraftCount(res.data?.draftCount || 0);
      })
      .catch(() => {
        setUserArticles([]);
        setPublishedToday(0);
      })
      .finally(() => setLoading(false));
  }, [user, isWriter]);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/bookmarks`)
      .then((res) => {
        setBookmarkCount(res.data.bookmarkCount || 0);
        setBookmarkedArticles(res.data.bookmarks || []);
      })
      .catch(() => {
        setBookmarkCount(0);
        setBookmarkedArticles([]);
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/comments/user/${user.id}`)
      .then((res) => {
        const comments = res.data.comments || [];
        setUserComments(comments);
        setCommentCount(comments.length);
      })
      .catch(() => {
        setUserComments([]);
        setCommentCount(0);
      });
  }, [user]);

  const filteredArticles =
    articleType === "ALL"
      ? userArticles
      : userArticles.filter((a) => a.status === articleType);

  const filterTabs = ["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"] as const;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {user?.name || "User"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s an overview of your activity and content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isWriter && (
          <>
            <DashboardStatCard
              title="Published Today"
              value={publishedToday}
              subtitle="Articles updated today"
              icon={TrendingUp}
              accentColor="bg-emerald-500/10 text-emerald-600"
            />
            <DashboardStatCard
              title="Total Articles"
              value={userArticles.length}
              subtitle="Your articles"
              icon={FileText}
              accentColor="bg-blue-500/10 text-blue-600"
            />
            <DashboardStatCard
              title="Drafts"
              value={draftCount}
              subtitle="Pending publication"
              icon={Clock}
              accentColor="bg-amber-500/10 text-amber-600"
            />
          </>
        )}
        <DashboardStatCard
          title="Bookmarks"
          value={bookmarkCount}
          subtitle="Saved articles"
          icon={Bookmark}
          accentColor="bg-violet-500/10 text-violet-600"
        />
        <DashboardStatCard
          title="Comments"
          value={commentCount}
          subtitle="Your discussions"
          icon={MessageSquare}
          accentColor="bg-rose-500/10 text-rose-600"
        />
      </div>

      {/* Writer Section: Articles */}
      {isWriter && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  Your Articles
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm">
                    <Link href="/articles/new" prefetch={false}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      New Article
                    </Link>
                  </Button>
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
        </motion.div>
      )}

      {/* Bookmarks & Comments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookmarked Articles */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bookmark className="h-5 w-5 text-muted-foreground" />
                Bookmarked Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookmarkedArticles.length > 0 ? (
                <div className="space-y-2">
                  {bookmarkedArticles.slice(0, 5).map((bm) => (
                    <Link
                      key={bm.id}
                      href={`/articles/${bm.article.slug}`}
                      prefetch={false}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/30 transition-colors group"
                    >
                      {bm.article.coverImage && (
                        <img
                          src={bm.article.coverImage}
                          alt=""
                          className="h-10 w-14 object-cover rounded-md flex-shrink-0 ring-1 ring-border/50"
                        />
                      )}
                      <span className="text-sm font-medium truncate flex-1 group-hover:text-primary transition-colors">
                        {bm.article.title}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No bookmarks yet. Save articles to find them easily!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Comments */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                Recent Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userComments.length > 0 ? (
                <div className="space-y-2">
                  {userComments.slice(0, 5).map((comment) => (
                    <Link
                      key={comment.id}
                      href={`/articles/${comment.article.slug}`}
                      prefetch={false}
                      className="block p-2.5 rounded-lg hover:bg-accent/30 transition-colors group"
                    >
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {comment.article.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        &ldquo;{comment.content}&rdquo;
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {comment.createdAt
                          ? new Date(comment.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    No comments yet. Join the conversation!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}