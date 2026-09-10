"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Video,
  Newspaper,
  RefreshCw,
  KeyRound,
  Play,
  Flame,
  Film,
  Eye,
  Search,
  CheckCircle2,
  Lock,
  Filter,
  FileText,
  Clock,
  Sparkles,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UniversalVideoPlayer, VideoThumbnailPreview, parseMediaUrl } from "@/components/UniversalVideoPlayer";
import ArticleLock from "@/components/ArticleLock";
import { ArticleCard } from "@/components/ArticleCard";
import { SubscriberWireCard } from "@/components/SubscriberWireCard";
import { SubscriberItemModal } from "@/components/SubscriberItemModal";
import { SubscriberMasthead } from "@/components/SubscriberMasthead";
import { ScrollReveal } from "@/components/ScrollReveal";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedArticleModal, setSelectedArticleModal] = useState<Article | null>(null);

  const fetchStatusAndContent = async () => {
    setLoading(true);
    try {
      // 1. Check Subscriber Status
      let subActive = false;
      try {
        const statusRes = await api.get("/subscribers/status");
        subActive = statusRes.data?.isSubscriber || false;
        setIsSubscriber(subActive);
        if (statusRes.data?.subscriberExpiresAt) {
          setExpiresAt(statusRes.data.subscriberExpiresAt);
        }
      } catch {
        setIsSubscriber(false);
      }

      // 2. Fetch Subscriber Articles if unlocked or user is staff
      const isStaff = user && (user.role === "ADMIN" || user.role === "EDITOR" || user.role === "REPORTER");
      if (subActive || isStaff) {
        try {
          const articlesRes = await api.get("/subscribers/dispatches");
          const list: Article[] = articlesRes.data?.dispatches || articlesRes.data?.data || [];
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
        } catch (err) {
          console.warn("Could not fetch subscriber dispatches:", err);
          setArticles([]);
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
    window.scrollTo({ top: 280, behavior: "smooth" });
  };

  // Unique categories list
  const categoryNames = Array.from(
    new Set(articles.map((a) => a.category?.name).filter(Boolean) as string[])
  );

  // Search & Category Filtering
  const searchedArticles = articles.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      (item.category && item.category.name.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Collect all video items from searched articles
  const allVideoItems = searchedArticles.flatMap((article) => {
    if (!article.videos || article.videos.length === 0) return [];
    return article.videos.map((v) => ({
      ...v,
      articleTitle: article.title,
      articleSlug: article.slug,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt || article.createdAt,
      author: article.author?.name || "TCV Investigative Desk",
      articleObj: article,
    }));
  });

  // Filter non-video articles for bottom feed (exclude video items on "all" tab to prevent duplicate rendering)
  const filteredArticles = searchedArticles.filter((item) => {
    const isShortNote = !item.content || item.content.length < 600 || (item.excerpt && item.excerpt.length > 50);
    const hasVideo = item.videos && item.videos.length > 0;

    if (feedFilter === "all") return !hasVideo;
    if (feedFilter === "videos") return hasVideo;
    if (feedFilter === "wire") return isShortNote;
    if (feedFilter === "articles") return !isShortNote;
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Cinematic Editorial Masthead */}
      <SubscriberMasthead
        isSubscriber={isSubscriber}
        expiresAt={expiresAt}
        totalDispatches={articles.length}
        totalVideos={allVideoItems.length}
        unlockSlot={
          !isSubscriber && !(user && (user.role === "ADMIN" || user.role === "EDITOR" || user.role === "REPORTER")) ? (
            <ArticleLock initialCode={codeParam} onUnlocked={fetchStatusAndContent} />
          ) : undefined
        }
      />

      {/* Main Content Container */}
      <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <RefreshCw className="h-7 w-7 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground font-medium">Decrypting Vault Files...</p>
          </div>
        ) : !isSubscriber && !(user && (user.role === "ADMIN" || user.role === "EDITOR" || user.role === "REPORTER")) ? (
          null
        ) : (
          /* Unlocked Member Vault Layout */
          <div className="space-y-12">
            {/* Top Spotlight Cinema Player ("The Desk Spotlight") */}
            {activeVideo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm max-w-4xl mx-auto space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <Film className="h-4 w-4" /> Spotlight Media Stream
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-md border border-border">
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
                      <h3 className="font-serif text-lg sm:text-2xl font-bold text-foreground leading-snug">
                        {activeVideo.title}
                      </h3>
                    )}
                  </div>

                  {activeVideo.articleObj && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedArticleModal(activeVideo.articleObj!)}
                      className="gap-1.5 text-xs font-semibold shrink-0 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Open Full Dispatch File</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Filter Controls: Live Search, Categories, & Format Tabs */}
            <ScrollReveal direction="up" delay={0.1}>
            <div className="space-y-4 border-b border-border pb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search case files, video drops, or wire dispatches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 text-sm bg-card border-border"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Format Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                  <div className="inline-flex rounded-lg border border-border bg-card p-1 text-xs font-medium">
                    {(
                      [
                        { id: "all", label: "🔥 All Dispatches" },
                        { id: "videos", label: "🎥 Video Drops" },
                        { id: "wire", label: "🎙️ Wire Briefs" },
                        { id: "articles", label: "📜 Restricted Reports" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFeedFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                          feedFilter === tab.id
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
                    title="Refresh Vault"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Category Filter Chips (if multiple exist) */}
              {categoryNames.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
                  <span className="text-muted-foreground font-medium text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Topic:
                  </span>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      selectedCategory === "all"
                        ? "bg-secondary text-secondary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground bg-card border border-border/60"
                    }`}
                  >
                    All Topics
                  </button>
                  {categoryNames.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        selectedCategory.toLowerCase() === cat.toLowerCase()
                          ? "bg-secondary text-secondary-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground bg-card border border-border/60"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </ScrollReveal>

            {/* YouTube-Style Video Drops Gallery Grid */}
            {(feedFilter === "all" || feedFilter === "videos") && allVideoItems.length > 0 && (
              <ScrollReveal direction="up" delay={0.15}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-primary" /> Video & Media Vault Drops ({allVideoItems.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {allVideoItems.map((vid, idx) => {
                    const mediaInfo = parseMediaUrl(vid.url);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition-all shadow-xs"
                      >
                        {/* Video Thumbnail Box with Frame Extractor */}
                        <div
                          onClick={() =>
                            handlePlayVideo(
                              vid.url,
                              vid.title || vid.articleTitle,
                              vid.coverImage,
                              vid.articleSlug,
                              vid.articleObj
                            )
                          }
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

                          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/85 text-[11px] font-medium text-white flex items-center gap-1 border border-white/10">
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
                                onClick={() =>
                                  handlePlayVideo(
                                    vid.url,
                                    vid.title || vid.articleTitle,
                                    vid.coverImage,
                                    vid.articleSlug,
                                    vid.articleObj
                                  )
                                }
                                className="text-primary font-semibold hover:underline cursor-pointer"
                              >
                                Play Stream ▶
                              </button>
                              {vid.articleObj && (
                                <button
                                  onClick={() => setSelectedArticleModal(vid.articleObj)}
                                  className="text-foreground/80 hover:text-primary cursor-pointer font-medium"
                                >
                                  Details
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              </ScrollReveal>
            )}

            {/* Wire Notes & Articles Feed */}
            {feedFilter !== "videos" && (
              filteredArticles.length === 0 ? (
                feedFilter !== "all" ? (
                  <div className="rounded-xl border border-border bg-card p-12 text-center max-w-3xl mx-auto">
                    <h3 className="font-serif text-lg font-semibold text-foreground">No Dispatches Found</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      No matching {feedFilter === "wire" ? "wire briefs" : "restricted reports"} found for your query.
                    </p>
                  </div>
                ) : null
              ) : (
                <ScrollReveal direction="up" delay={0.2}>
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Newspaper className="h-4 w-4 text-primary" /> Subscriber Wire Notes & Investigative Dispatches ({filteredArticles.length})
                    </h3>
                  </div>
                  {filteredArticles.map((item, idx) => {
                    const isShortWire =
                      feedFilter === "wire" ||
                      !item.content ||
                      item.content.length < 600 ||
                      (item.excerpt && item.excerpt.length > 30 && item.content.length < 1000);

                    if (isShortWire) {
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <SubscriberWireCard
                            article={item}
                            onPlayVideo={(url, title) => handlePlayVideo(url, title, item.coverImage, item.slug, item)}
                            onOpenModal={(art) => setSelectedArticleModal(art)}
                          />
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <ArticleCard article={item} />
                      </motion.div>
                    );
                  })}
                </div>
                </ScrollReveal>
              )
            )}
          </div>
        )}
      </div>

      {/* Confidential Dispatch Detail Reader Modal */}
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
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-foreground">Decrypting Vault...</div>}>
      <SubscribersContent />
    </Suspense>
  );
}
