"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Video, Newspaper, RefreshCw, KeyRound, Play, Flame, Film, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UniversalVideoPlayer, VideoThumbnailPreview, parseMediaUrl } from "@/components/UniversalVideoPlayer";
import ArticleLock from "@/components/ArticleLock";
import { ArticleCard } from "@/components/ArticleCard";
import { SubscriberWireCard } from "@/components/SubscriberWireCard";
import { SubscriberItemModal } from "@/components/SubscriberItemModal";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/lib/api";
import type { Article } from "@/lib/types";

interface ArticleVideo {
  id: string;
  type: string;
  url: string;
  title?: string;
  coverImage?: string;
  articleSlug?: string;
  articleObj?: Article;
}

type FeedFilter = "all" | "videos" | "wire" | "articles";

function SubscribersContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code") || "";
  const postParam = searchParams.get("post") || "";
  const { user } = useUserStore();

  const [isSubscriber, setIsSubscriber] = useState<boolean | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<ArticleVideo | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [selectedArticleModal, setSelectedArticleModal] = useState<Article | null>(null);

  const fetchStatusAndContent = async () => {
    setLoading(true);
    try {
      // 1. Check Subscriber Status
      const statusRes = await api.get("/subscribers/status");
      const subActive = statusRes.data?.isSubscriber || false;
      setIsSubscriber(subActive);
      if (statusRes.data?.subscriberExpiresAt) {
        setExpiresAt(statusRes.data.subscriberExpiresAt);
      }

      // 2. Fetch Subscriber Articles if unlocked or user is staff
      const isStaff = user && (user.role === "ADMIN" || user.role === "EDITOR" || user.role === "REPORTER");
      if (subActive || isStaff) {
        const articlesRes = await api.get("/articles?subscriberOnly=true");
        const list: Article[] = articlesRes.data?.data || articlesRes.data?.articles || [];
        setArticles(list);

        // Check if query param specifies a specific post
        if (postParam) {
          const matched = list.find((a) => a.id === postParam || a.slug === postParam);
          if (matched) setSelectedArticleModal(matched);
        }

        // Auto-select latest video for top cinema player
        for (const item of list) {
          if (item.videos && item.videos.length > 0) {
            const v = item.videos[0];
            setActiveVideo({
              id: v.url,
              type: v.type,
              url: v.url,
              title: v.title || item.title,
              coverImage: item.coverImage || undefined,
              articleSlug: item.slug,
              articleObj: item,
            });
            break;
          }
        }
      }
    } catch (err) {
      console.error("Failed to load subscriber hub:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatusAndContent();
  }, [user]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handlePlayVideo = (
    url: string,
    title?: string,
    coverImage?: string | null,
    articleSlug?: string,
    articleObj?: Article
  ) => {
    setActiveVideo({
      id: url,
      type: "video",
      url,
      title,
      coverImage: coverImage || undefined,
      articleSlug,
      articleObj,
    });
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Collect all video items from articles
  const allVideoItems = articles.flatMap((article) => {
    if (!article.videos || article.videos.length === 0) return [];
    return article.videos.map((v) => ({
      ...v,
      articleTitle: article.title,
      articleSlug: article.slug,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt || article.createdAt,
      author: article.author?.name || "TCV Media",
      articleObj: article,
    }));
  });

  // Filter articles based on feedFilter (exclude video items on "all" tab to prevent duplicate rendering)
  const filteredArticles = articles.filter((item) => {
    const isShortNote = !item.content || item.content.length < 600 || (item.excerpt && item.excerpt.length > 50);
    const hasVideo = item.videos && item.videos.length > 0;

    if (feedFilter === "all") return !hasVideo;
    if (feedFilter === "videos") return hasVideo;
    if (feedFilter === "wire") return isShortNote;
    if (feedFilter === "articles") return !isShortNote;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Editorial Header Section */}
      <div className="border-b border-border bg-card py-10 sm:py-14 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold tracking-widest text-primary uppercase flex items-center justify-center gap-1.5">
            <Flame className="h-3.5 w-3.5 fill-primary" /> Exclusive Video Vault & Wire
          </p>

          <h1 className="mt-3 font-serif text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
            Instagram Subscriber Lounge
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
            Raw unedited video drops, investigative media streams, and restricted reports reserved for active Instagram subscribers.
          </p>

          {/* Status Indicator Banner */}
          <div className="mt-6 flex justify-center">
            {isSubscriber ? (
              <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300 shadow-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>30-Day Subscriber Membership Active</span>
                {expiresAt && (
                  <span className="text-muted-foreground border-l border-emerald-300 dark:border-emerald-800 pl-2 ml-1">
                    Expires {formatDate(expiresAt)}
                  </span>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/60 px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground">
                <KeyRound className="h-4 w-4 text-primary shrink-0" />
                <span>Passcode required to view restricted video drops</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="h-6 w-6 text-primary animate-spin" />
            <p className="mt-3 text-xs text-muted-foreground">Loading video drops...</p>
          </div>
        ) : !isSubscriber && !(user && (user.role === "ADMIN" || user.role === "EDITOR" || user.role === "REPORTER")) ? (
          /* Locked State */
          <div className="mx-auto max-w-xl my-6">
            <ArticleLock initialCode={codeParam} onUnlocked={fetchStatusAndContent} />
          </div>
        ) : (
          /* Unlocked State - YouTube / Media Vault Layout */
          <div className="space-y-12">
            {/* Top Spotlight Cinema Player */}
            {activeVideo && (
              <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xl max-w-4xl mx-auto space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="h-4 w-4" /> Now Playing: Spotlight Media Drop
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                    {parseMediaUrl(activeVideo.url).label}
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden bg-black shadow-inner">
                  {parseMediaUrl(activeVideo.url).provider === "twitter" ? (
                    <div className="w-full flex justify-center py-2">
                      <UniversalVideoPlayer url={activeVideo.url} title={activeVideo.title} />
                    </div>
                  ) : (
                    <div className="aspect-video w-full">
                      <UniversalVideoPlayer url={activeVideo.url} title={activeVideo.title} />
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div>
                    {activeVideo.title && (
                      <h3 className="font-serif text-lg sm:text-2xl font-bold text-foreground">
                        {activeVideo.title}
                      </h3>
                    )}
                  </div>

                  {activeVideo.articleObj && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedArticleModal(activeVideo.articleObj!)}
                      className="gap-1.5 text-xs font-medium shrink-0"
                    >
                      <Eye className="h-3.5 w-3.5 text-primary" />
                      <span>View Full Drop Details</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Format Filter Tabs & Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                  <Video className="h-5 w-5 text-primary" /> Exclusive Media Vault
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {allVideoItems.length} video drops • {articles.length} total posts unlocked
                </p>
              </div>

              {/* Format Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <div className="inline-flex rounded-lg border bg-card p-1 text-xs font-medium">
                  {(
                    [
                      { id: "all", label: "All Updates" },
                      { id: "videos", label: "🎥 Video Drops" },
                      { id: "wire", label: "Short Notes" },
                      { id: "articles", label: "Articles" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFeedFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        feedFilter === tab.id
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchStatusAndContent}
                  className="text-xs h-9 px-2.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* YouTube-Style Video Drops Gallery Grid */}
            {(feedFilter === "all" || feedFilter === "videos") && allVideoItems.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Video & Media Vault Drops ({allVideoItems.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {allVideoItems.map((vid, idx) => {
                    const mediaInfo = parseMediaUrl(vid.url);
                    return (
                      <div
                        key={idx}
                        className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:border-primary/40 transition-all shadow-xs"
                      >
                        {/* Video Thumbnail Box */}
                        <div
                          onClick={() => handlePlayVideo(vid.url, vid.title || vid.articleTitle, vid.coverImage, vid.articleSlug, vid.articleObj)}
                          className="relative aspect-video w-full overflow-hidden bg-black cursor-pointer"
                        >
                          <VideoThumbnailPreview
                            url={vid.url}
                            coverImage={vid.coverImage}
                            title={vid.title || vid.articleTitle}
                          />

                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                            <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                              <Play className="h-5 w-5 fill-current ml-0.5" />
                            </div>
                          </div>

                          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/80 text-[11px] font-medium text-white flex items-center gap-1 border border-white/10">
                            <span>{mediaInfo.label}</span>
                          </div>
                        </div>

                        {/* Video Info */}
                        <div className="p-4 flex flex-1 flex-col justify-between space-y-3">
                          <h4
                            onClick={() => vid.articleObj && setSelectedArticleModal(vid.articleObj)}
                            className="font-serif font-bold text-foreground text-base line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                          >
                            {vid.title || vid.articleTitle}
                          </h4>

                          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2.5">
                            <span>{vid.author}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handlePlayVideo(vid.url, vid.title || vid.articleTitle, vid.coverImage, vid.articleSlug, vid.articleObj)}
                                className="text-primary font-semibold hover:underline cursor-pointer"
                              >
                                Play Spotlight ▶
                              </button>
                              {vid.articleObj && (
                                <button
                                  onClick={() => setSelectedArticleModal(vid.articleObj)}
                                  className="text-foreground/80 hover:text-primary cursor-pointer"
                                >
                                  Details
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wire Notes & Articles Feed */}
            {feedFilter !== "videos" && (
              filteredArticles.length === 0 ? (
                feedFilter !== "all" ? (
                  <div className="rounded-xl border border-border bg-card p-12 text-center max-w-3xl mx-auto">
                    <h3 className="font-serif text-lg font-semibold text-foreground">No Items Match this Filter</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No {feedFilter === "wire" ? "short wire notes" : "full articles"} available right now.
                    </p>
                  </div>
                ) : null
              ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Newspaper className="h-4 w-4 text-primary" /> Subscriber Wire Notes & Reports ({filteredArticles.length})
                    </h3>
                  </div>
                  {filteredArticles.map((item) => {
                    const isShortWire =
                      feedFilter === "wire" ||
                      !item.content ||
                      item.content.length < 600 ||
                      (item.excerpt && item.excerpt.length > 30 && item.content.length < 1000);

                    if (isShortWire) {
                      return (
                        <SubscriberWireCard
                          key={item.id}
                          article={item}
                          onPlayVideo={(url, title) => handlePlayVideo(url, title, item.coverImage, item.slug, item)}
                          onOpenModal={(art) => setSelectedArticleModal(art)}
                        />
                      );
                    }

                    return <ArticleCard key={item.id} article={item} />;
                  })}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Subscriber Item Detail Modal Reader */}
      {selectedArticleModal && (
        <SubscriberItemModal
          article={selectedArticleModal}
          onClose={() => setSelectedArticleModal(null)}
        />
      )}
    </div>
  );
}

export default function SubscribersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>}>
      <SubscribersContent />
    </Suspense>
  );
}
