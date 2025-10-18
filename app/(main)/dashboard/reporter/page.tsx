"use client";
import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/lib/api";
import { Article } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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

export default function ReporterDashboard() {
  const { user } = useUserStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleType, setArticleType] = useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">("ALL");
  const [publishedToday, setPublishedToday] = useState(0);
  const [draftCount, setDraftCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api
      .get<ArticlesResponse>(`/articles?author=${user.name}&authorId=${user.id}&limit=10`)
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

  // Filter articles by type
  const filteredArticles =
    articleType === "ALL"
      ? articles
      : articles.filter((a) => a.status === articleType);

  return (
<ProtectedRoute>
      <div className="container mx-auto px-4 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reporter Dashboard
            <Badge variant="secondary" className="ml-2">{user?.role}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Welcome, {user?.name || user?.email}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Published Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedToday}</div>
            <p className="text-xs text-muted-foreground">
              Articles published today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
            <p className="text-xs text-muted-foreground">
              Your articles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {draftCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Your drafts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button asChild>
          <Link href="/articles/new">
            <Plus className="mr-2 h-4 w-4" />
            New Article
          </Link>
        </Button>
        {/* New Article Button and Article Type Selector */}
            <select
              value={articleType}
              onChange={e => setArticleType(e.target.value as typeof articleType)}
              className="w-40 border rounded px-2 py-1 dark:bg-black dark:text-white"
            >
              <option value="ALL">All</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
    

      <Card>
        <CardHeader>
          <CardTitle>
            <FileText className="h-5 w-5 mr-2" />
            Your Articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : filteredArticles.length > 0 ? (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div key={article.id} className="p-4 border rounded-lg flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {article.coverImage && (
                      <img
                        src={article.coverImage}
                        alt="cover"
                        className="h-10 w-16 object-cover rounded mr-2"
                      />
                    )}
                    <span className="font-semibold">{article.title}</span>
                    <Badge variant="outline">{article.status}</Badge>
                    {article.category && (
                      <Badge variant="secondary">{article.category.name}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {article.createdAt
                      ? new Date(article.createdAt).toLocaleDateString()
                      : ""}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/articles/special-access/${article.id}`}>View</Link>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/articles/special-access/${article.slug}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-6">
              No articles yet. Start writing your first article!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
</ProtectedRoute>
  );
}