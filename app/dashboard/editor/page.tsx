"use client";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Eye, Edit, Clock, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Article } from "@/lib/types";
import Link from "next/link";

type ArticlesResponse = {
  data: Article[];
  pagination: {total: number;
  page: number;
  limit: number;
  totalPages: number;};
  updatedTodayCount: number;
};

export default function EditorDashboard() {
  // Article state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleLoading, setArticleLoading] = useState(true);
  const [articlePage, setArticlePage] = useState(1);
  const articleLimit = 5;
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
    } catch (error) {
      toast.error("Failed to load articles");
      console.error(error);
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
      setArticles(prev => prev.map(article =>
        article.id === articleId ? { ...article, status: status as Article["status"] } : article
      ));
      toast.success("Article status updated successfully");
    } catch (error) {
      toast.error("Failed to update article status");
    }
  };

  const deleteArticle = async (articleId: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await api.delete(`/articles/${articleId}`);
      setArticles(prev => prev.filter(article => article.id !== articleId));
      toast.success("Article deleted successfully");
    } catch {
      toast.error("Failed to delete article");
    }
  };

  // Only drafts for review queue
  const reviewQueue = articles.filter(a => a.status === "DRAFT");

  return (
    <RequireAuth allowedRoles={["EDITOR"]}>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editor Dashboard</h1>
            <p className="text-muted-foreground">Review and manage articles from reporters</p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Edit className="h-3 w-3" />
            Editor
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviewQueue.length}</div>
              <p className="text-xs text-muted-foreground">
                Articles awaiting review
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Today</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {publishedToday}
              </div>
              <p className="text-xs text-muted-foreground">
                Articles published today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{articleCount}</div>
              <p className="text-xs text-muted-foreground">
                All articles in system
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Article Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Article Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Search articles..."
                value={articleSearchInput}
                onChange={e => setArticleSearchInput(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline" onClick={handleArticleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {articleLoading ? <div>Loading articles...</div> : (
              <div className="space-y-4">
                {articles.map(article => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{article.title}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>By {article.author?.name}</span>
                        <Badge variant="outline">{article.status}</Badge>
                        {article.category && <Badge variant="secondary">{article.category.name}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Select value={article.status} onValueChange={status => updateArticleStatus(article.id, status)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PUBLISHED">Published</SelectItem>
                          <SelectItem value="ARCHIVED">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="destructive" size="sm" onClick={() => deleteArticle(article.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/articles/special-access/${article.id}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center gap-2 mt-4">
                  <Button variant="outline" size="sm" disabled={articlePage <= 1} onClick={() => setArticlePage(p => p - 1)}>Previous</Button>
                  <span className="px-2 py-1 text-sm">Page {articlePage} of {articleTotalPages}</span>
                  <Button variant="outline" size="sm" disabled={articlePage >= articleTotalPages} onClick={() => setArticlePage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}