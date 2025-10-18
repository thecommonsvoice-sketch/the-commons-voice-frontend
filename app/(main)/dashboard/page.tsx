"use client";
import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequiredAuth";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/lib/api";
import { Article } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import  {Skeleton}  from "@/components/ui/loading-skeleton";
import { FileText, Edit, Plus } from "lucide-react";
import Link from "next/link";

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

export default function Dashboard() {
  const { user } = useUserStore();
  // const router = useRouter();
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [articleType, setArticleType] = useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">("ALL");
  const [publishedToday, setPublishedToday] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  useEffect(() => {
    if (!user) return;
    api
      .get(`/bookmarks`)
      .then((res) => {
        setBookmarkCount(res.data.bookmarkCount || 0);
      })
      .catch(() => {
        setBookmarkCount(0);
      });

      
  }, [user]);

  // Filter articles by type
  const filteredArticles =
    articleType === "ALL"
      ? userArticles
      : userArticles.filter((a) => a.status === articleType);

  return (
    <RequireAuth allowedRoles={["ADMIN","EDITOR" ,"REPORTER" ,"USER"]}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-lg sm:text-xl">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="break-words">Welcome, {user?.name || user?.email || "User"}</span>
              </div>
              <Badge variant="secondary" className="self-start sm:ml-2 text-xs">{user?.role}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm sm:text-base text-muted-foreground break-all">
              Email: <span className="break-all">{user?.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

{
          (user?.role === "REPORTER" || user?.role === "EDITOR" || user?.role === "ADMIN") && (
            <>
                      <Card>
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm font-medium">Published Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{publishedToday}</div>
              <p className="text-xs sm:text-xs text-muted-foreground">
                Articles published today
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm font-medium">Total Published Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{userArticles.length}</div>
              <p className="text-xs sm:text-xs text-muted-foreground">
                Your articles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm font-medium">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {draftCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Your drafts
              </p>
            </CardContent>
          </Card>
            </>
          )      
}

          <Card>
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm font-medium">Bookmarks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {bookmarkCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Bookmarked Articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs sm:text-sm font-medium">Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {draftCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Total Comments Made
              </p>
            </CardContent>
          </Card>
        </div>

        {/* New Article Button and Article Type Selector */}
        {(user?.role === "REPORTER" || user?.role === "EDITOR" || user?.role === "ADMIN") && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/articles/new">
                <Plus className="mr-2 h-4 w-4" />
                New Article
              </Link>
            </Button>
            <select
              value={articleType}
              onChange={e => setArticleType(e.target.value as typeof articleType)}
              className="w-full sm:w-40 border rounded px-2 py-2 sm:py-1 text-sm dark:bg-black"
            >
              <option value="ALL">All</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        )}

        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Recent Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : filteredArticles.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="p-3 sm:p-4 border rounded-lg flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {article.coverImage && (
                          <img
                            src={article.coverImage}
                            alt="cover"
                            className="h-10 w-16 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <span className="font-semibold text-sm sm:text-base break-words flex-1 min-w-0">{article.title}</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">{article.status}</Badge>
                        {article.category && (
                          <Badge variant="secondary" className="text-xs">{article.category.name}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      By {article.author?.name} &middot;{" "}
                      {article.createdAt
                        ? new Date(article.createdAt).toLocaleDateString()
                        : ""}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/articles/${article.slug}`}>View</Link>
                      </Button>
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/articles/${article.slug}/edit`}>Edit</Link>
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
    </RequireAuth>
  );
}