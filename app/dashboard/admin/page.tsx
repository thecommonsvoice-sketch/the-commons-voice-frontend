"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, FileText, Shield, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import type { User, Article } from "@/lib/types";
import Link from "next/link";

// Define API response types
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

export default function AdminDashboard() {
  // User state
  const [users, setUsers] = useState<User[]>([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userPage, setUserPage] = useState(1);
  const userLimit = 5;
  const [userSearch, setUserSearch] = useState("");
  const [userSearchInput, setUserSearchInput] = useState(""); // controlled input
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
  const [statsLoading, setStatsLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [articleCount, setArticleCount] = useState(0);
  const [publishedToday, setPublishedToday] = useState(0);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setUserLoading(true);
      try {
        const { data }: { data: UsersResponse } = await api.get(
          `/admin/users?page=${userPage}&limit=${userLimit}&search=${encodeURIComponent(
            userSearch
          )}`
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
          `/admin/articles?page=${articlePage}&limit=${articleLimit}&search=${encodeURIComponent(
            articleSearch
          )}`
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

  // Remove setUsers/setArticles from stats fetch!
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        // Optionally, you can fetch counts here if your API supports it
        // But don't overwrite users/articles state!
      } catch {
        // Silently fail
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Handlers
  const handleUserSearch = () => {
    setUserPage(1);
    setUserSearch(userSearchInput.trim());
  };

  const handleArticleSearch = () => {
    setArticlePage(1);
    setArticleSearch(articleSearchInput.trim());
  };

  // Auto-refresh on search clear (users)
  useEffect(() => {
    if (userSearchInput === "") {
      setUserSearch("");
      setUserPage(1);
    }
  }, [userSearchInput]);

  // Auto-refresh on search clear (articles)
  useEffect(() => {
    if (articleSearchInput === "") {
      setArticleSearch("");
      setArticlePage(1);
    }
  }, [articleSearchInput]);

  const updateUserRole = async (userId: string, role: User["role"]) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role } : user))
      );
      toast.success("User role updated successfully");
    } catch {
      toast.error("Failed to update user role");
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
      toast.error("Failed to update user status");
    }
  };

  const updateArticleStatus = async (
    articleId: string,
    status: Article["status"]
  ) => {
    try {
      await api.patch(`/admin/articles/${articleId}/status`, { status });
      setArticles((prev) =>
        prev.map((article) =>
          article.id === articleId ? { ...article, status } : article
        )
      );
      toast.success("Article status updated successfully");
    } catch {
      toast.error("Failed to update article status");
    }
  };

  const deleteArticle = async (articleId: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await api.delete(`/admin/articles/${articleId}`);
      setArticles((prev) => prev.filter((article) => article.id !== articleId));
      toast.success("Article deleted successfully");
    } catch {
      toast.error("Failed to delete article");
    }
  };

  return (
    <RequireAuth allowedRoles={["ADMIN"]}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users and content across the platform
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            Administrator
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Total Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articleCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Published Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedToday}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {articles.filter((a) => a.status === "DRAFT").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Search users..."
                value={userSearchInput}
                onChange={(e) => setUserSearchInput(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline" onClick={handleUserSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {userLoading ? (
              <div>Loading users...</div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name || user.email}</p>
                        {user.isActive ? (
                          <Badge variant={"outline"}>Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={user.role}
                        onValueChange={(role) =>
                          updateUserRole(user.id, role as User["role"])
                        }
                        disabled={user.role === "ADMIN"} // Disable for admin users
                      >
                        <SelectTrigger className="w-32">
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
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id)}
                        disabled={user.role === "ADMIN"} // Disable for admin users
                      >
                        Toggle Status
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-2 py-1 text-sm">
                    Page {userPage} of {userTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={userPage >= userTotalPages}
                    onClick={() => setUserPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Article Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Article Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Search articles..."
                value={articleSearchInput}
                onChange={(e) => setArticleSearchInput(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline" onClick={handleArticleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {articleLoading ? (
              <div>Loading articles...</div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{article.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>By {article.author?.name}</span>
                        <Badge variant="outline">{article.status}</Badge>
                        {article.category && (
                          <Badge variant="secondary">
                            {article.category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/articles/special-access/${article.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Link>

                      <Select
                        value={article.status}
                        onValueChange={(status) =>
                          updateArticleStatus(
                            article.id,
                            status as Article["status"]
                          )
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteArticle(article.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={articlePage <= 1}
                    onClick={() => setArticlePage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="px-2 py-1 text-sm">
                    Page {articlePage} of {articleTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={articlePage >= articleTotalPages}
                    onClick={() => setArticlePage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
