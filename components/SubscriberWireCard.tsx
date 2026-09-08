"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, MessageSquare, Play, Video, Share2, ChevronDown, ChevronUp, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommentsSidebar } from "@/components/CommentSidebar";
import type { Article } from "@/lib/types";
import { toast } from "sonner";

import { UniversalVideoPlayer, parseMediaUrl } from "@/components/UniversalVideoPlayer";

import { Eye } from "lucide-react";

interface SubscriberWireCardProps {
  article: Article;
  onPlayVideo?: (url: string, title?: string) => void;
  onOpenModal?: (article: Article) => void;
}

export function SubscriberWireCard({ article, onPlayVideo, onOpenModal }: SubscriberWireCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const dateStr = article.publishedAt || article.createdAt;
  const publishedTime = dateStr
    ? formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    : "";

  const hasVideo = article.videos && article.videos.length > 0;
  const video = hasVideo ? article.videos![0] : null;
  const mediaInfo = video ? parseMediaUrl(video.url) : null;

  // Prefer content over excerpt if available
  const fullText = article.content || article.excerpt || "";
  const shouldTruncate = fullText.length > 350;
  const displayText = isExpanded || !shouldTruncate ? fullText : fullText.slice(0, 350) + "…";

  const copyPostLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://thecommonsvoice.com";
    const postUrl = `${siteUrl}/subscribers?post=${article.id}`;
    navigator.clipboard.writeText(postUrl);
    toast.success("Note link copied to clipboard!");
  };

  const handlePlayClick = () => {
    if (onPlayVideo && video) {
      onPlayVideo(video.url, video.title || article.title);
    } else if (onOpenModal) {
      onOpenModal(article);
    }
  };

  return (
    <>
      <div id={`post-${article.id}`} className="rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4 hover:border-primary/40 transition-colors">
        {/* Header: Reporter info & badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0 border border-primary/20">
              {(article.author?.name || "TCV")?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">
                  {article.author?.name || "TCV Investigative Wire"}
                </span>
                <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Exclusive Note
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{publishedTime}</p>
            </div>
          </div>

          {article.category && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
              {article.category.name}
            </span>
          )}
        </div>

        {/* Title / Headline (Clickable to open modal viewer) */}
        <h3
          onClick={() => onOpenModal && onOpenModal(article)}
          className="font-serif text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
        >
          {article.title}
        </h3>

        {/* Note Body Text */}
        {displayText && (
          <div className="text-sm text-foreground/90 leading-relaxed font-sans whitespace-pre-line">
            {displayText}
            {shouldTruncate && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-2 inline-flex items-center text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                {isExpanded ? (
                  <>Show Less <ChevronUp className="h-3 w-3 ml-0.5" /></>
                ) : (
                  <>Read More <ChevronDown className="h-3 w-3 ml-0.5" /></>
                )}
              </button>
            )}
          </div>
        )}

        {/* Media Embed Preview */}
        {hasVideo && video ? (
          mediaInfo?.provider === "audio" ? (
            <UniversalVideoPlayer url={video.url} title={video.title || article.title} autoPlay={false} />
          ) : (
            <div className="relative aspect-video w-full max-h-[360px] overflow-hidden rounded-lg bg-black group border border-border shadow-sm">
              {article.coverImage && (
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <button
                onClick={handlePlayClick}
                className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors cursor-pointer"
              >
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                  <Play className="h-6 w-6 fill-current ml-0.5" />
                </div>
              </button>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/80 text-xs text-white flex items-center gap-2 font-sans font-medium border border-white/10 shadow-md">
                <Video className="h-4 w-4 text-primary" /> {mediaInfo?.label || "Exclusive Video Drop"}
              </div>
            </div>
          )
        ) : article.coverImage ? (
          <div
            onClick={() => onOpenModal && onOpenModal(article)}
            className="relative aspect-video w-full max-h-[320px] overflow-hidden rounded-lg bg-muted border border-border cursor-pointer group"
          >
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : null}

        {/* Footer Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            {onOpenModal && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenModal(article)}
                className="h-8 px-2.5 text-xs text-foreground font-medium gap-1.5"
              >
                <Eye className="h-3.5 w-3.5 text-primary" />
                <span>Open Full Drop</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommentsOpen(true)}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Discussion</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={copyPostLink}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share Note</span>
          </Button>
        </div>
      </div>

      {isCommentsOpen && (
        <CommentsSidebar
          articleId={article.id}
          onClose={() => setIsCommentsOpen(false)}
        />
      )}
    </>
  );
}
