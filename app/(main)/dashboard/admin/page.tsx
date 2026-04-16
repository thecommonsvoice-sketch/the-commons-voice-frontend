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
  Users,
  FileText,
  Search,
  Eye,
  TrendingUp,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Newspaper,
} from "lucide-react";
import { toast } from "sonner";
import type { User, Article } from "@/lib/types";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";

type Pagination = {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
};

type UsersResponse = {
  users: User[];
  pagination: Pagination;
};

type ArticlesResponse = {
  articles: Article[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  publishedTodayCount: number;
};

const STATUS_COLORS: Record<string, string> = {
  PUBLISHED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  DRAFT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  ARCHIVED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  EDITOR: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  REPORTER: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  USER: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
};

export default function AdminDashboard() {
  const { user } = useUserStore();
  const router = useRouter();

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  // User state
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const userLimit = 5;
  const [userSearch, setUserSearch] = useState("");
  const [userSearchInput, setUserSearchInput] = useState("");
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Article state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleLoading, setArticleLoading] = useState(true);
  const [articlePage, setArticlePage] = useState(1);
  const articleLimit = 5;
  const [articleSearch, setArticleSearch] = useState("");
  const [articleSearchInput, setArticleSearchInput] = useState("");
  const [articleTotalPages, setArticleTotalPages] = useState(1);

  // Stats
  const [userCount, setUserCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const [publishedToday, setPublishedToday] = useState(0);

  // Active tab
  const [activeTab, setActiveTab] = useState<"users" | "articles">("users");

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setUserLoading(true);
      try {
        const { data }: { data: UsersResponse } = await api.get(
          `/admin/users?page=${userPage}&limit=${userLimit}&search=${encodeURIComponent(userSearch)}`
        );
        setUsers(data?.users);
        setUserTotalPages(data?.pagination.totalPages);
        setUserCount(data?.pagination?.total);
      } catch {
        toast.error("Failed to load users");
      } finally {
        setUserLoading(false);
      }
    };
    fetchUsers();
  }, [userPage, userSearch]);

  // Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      setArticleLoading(true);
      try {
        const { data }: { data: ArticlesResponse } = await api.get(
          `/admin/articles?page=${articlePage}&limit=${articleLimit}&search=${encodeURIComponent(articleSearch)}`
        );
        setArticles(data?.articles);
        setArticleTotalPages(data?.totalPages);
        setArticleCount(data?.total);
        setPublishedToday(data?.publishedTodayCount || 0);
      } catch {
        toast.error("Failed to load articles");
      } finally {
        setArticleLoading(false);
      }
    };
    fetchArticles();
  }, [articlePage, articleSearch]);

  const handleUserSearch = () => {
    setUserPage(1);
    setUserSearch(userSearchInput.trim());
  };

  const handleArticleSearch = () => {
    setArticlePage(1);
    setArticleSearch(articleSearchInput.trim());
  };

  useEffect(() => {
    if (userSearchInput === "") { setUserSearch(""); setUserPage(1); }
  }, [userSearchInput]);

  useEffect(() => {
    if (articleSearchInput === "") { setArticleSearch(""); setArticlePage(1); }
  }, [articleSearchInput]);

  const updateUserRole = async (userId: string, role: User["role"]) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role } : user))
      );
      toast.success("User role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const { data }: { data: { user: User } } = await api.patch(
        `/admin/users/${userId}/toggle`
      );
      toast.success("User status updated");
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, isActive: data.user.isActive } : user
        )
      );
    } catch {
      toast.error("Failed to update status");
    }
  };

  const updateArticleStatus = async (articleId: string, status: Article["status"]) => {
    try {
      await api.patch(`/admin/articles/${articleId}/status`, { status });
      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId ? { ...article, status } : article
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
      await api.delete(`/admin/articles/${articleId}`);
      setArticles((prev) => prev.filter((article) => article.id !== articleId));
      toast.success("Article deleted");
    } catch {
      toast.error("Failed to delete article");
    }
  };

  if (user && user.role !== "ADMIN") return null;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage users, content, and platform settings.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/admin/categories">Manage Categories</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStatCard
          title="Total Users"
          value={userCount}
          subtitle="Registered accounts"
          icon={Users}
          accentColor="bg-blue-500/10 text-blue-600"
        />
        <DashboardStatCard
          title="Total Articles"
          value={articleCount}
          subtitle="All content"
          icon={Newspaper}
          accentColor="bg-purple-500/10 text-purple-600"
        />
        <DashboardStatCard
          title="Published Today"
          value={publishedToday}
          subtitle="New content today"
          icon={TrendingUp}
          accentColor="bg-emerald-500/10 text-emerald-600"
        />
        <DashboardStatCard
          title="Drafts"
          value={articles.filter((a) => a.status === "DRAFT").length}
          subtitle="Awaiting review"
          icon={Clock}
          accentColor="bg-amber-500/10 text-amber-600"
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === "users"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCog className="h-4 w-4" />
          Users
        </button>
        <button
          onClick={() => setActiveTab("articles")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeTab === "articles"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" />
          Articles
        </button>
      </div>

      {/* User Management */}
      {activeTab === "users" && (
        <motion.div
          key="users"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-muted-foreground" />
                User Management
              </CardTitle>
              <div className="flex items-center gap-2 mt-3">
                <Input
                  placeholder="Search by name or email..."
                  value={userSearchInput}
                  onChange={(e) => setUserSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUserSearch()}
                  className="max-w-xs h-9 text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleUserSearch} className="h-9">
                  <Search className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {userLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((u, idx) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-accent/30 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {(u.name || u.email)?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate">
                              {u.name || u.email}
                            </p>
                            {u.isActive ? (
                              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            ) : (
                              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {u.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            ROLE_COLORS[u.role] || ""
                          }`}
                        >
                          {u.role}
                        </span>
                        <Select
                          value={u.role}
                          onValueChange={(role) =>
                            updateUserRole(u.id, role as User["role"])
                          }
                          disabled={u.role === "ADMIN"}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="REPORTER">Reporter</SelectItem>
                            <SelectItem value="EDITOR">Editor</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleUserStatus(u.id)}
                          disabled={u.role === "ADMIN"}
                          className="h-8 text-xs px-2"
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Pagination */}
                  <div className="flex items-center justify-between pt-3 border-t mt-3">
                    <p className="text-xs text-muted-foreground">
                      Page {userPage} of {userTotalPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={userPage <= 1}
                        onClick={() => setUserPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        disabled={userPage >= userTotalPages}
                        onClick={() => setUserPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Article Management */}
      {activeTab === "articles" && (
        <motion.div
          key="articles"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
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
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
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
                        <Select
                          value={article.status}
                          onValueChange={(status) =>
                            updateArticleStatus(article.id, status as Article["status"])
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
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
