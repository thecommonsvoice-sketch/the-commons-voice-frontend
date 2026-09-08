"use client";

import { useEffect } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { X, ShieldCheck, Share2, Calendar, User, Tag, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UniversalVideoPlayer, parseMediaUrl } from "@/components/UniversalVideoPlayer";
import type { Article } from "@/lib/types";
import { toast } from "sonner";
import { CommentsSidebar } from "@/components/CommentSidebar";
import { useState } from "react";

interface SubscriberItemModalProps {
  article: Article | null;
  onClose: () => void;
}

export function SubscriberItemModal({ article, onClose }: SubscriberItemModalProps) {
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  const dateStr = article.publishedAt || article.createdAt;
  const publishedTime = dateStr
    ? formatDistanceToNow(new Date(dateStr), { addSuffix: true })
    : "";

  const hasVideo = article.videos && article.videos.length > 0;
  const video = hasVideo ? article.videos![0] : null;
  const mediaInfo = video ? parseMediaUrl(video.url) : null;

  const copyLink = () => {  
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://thecommonsvoice.com";
    navigator.clipboard.writeText(`${siteUrl}/subscribers?post=${article.id}`);
    toast.success("Post link copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs sm:p-6 overflow-y-auto">
      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl text-foreground my-auto flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Exclusive Subscriber Vault
            </Badge>
            {article.category && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {article.category.name}
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-1">
          {/* Article / Drop Headline */}
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
            {article.title}
          </h2>

          {/* Author & Timestamp */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b border-border/60 pb-4">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="h-3.5 w-3.5 text-primary" />
              {article.author?.name || "TCV Investigative Media"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {publishedTime}
            </span>
            {mediaInfo && (
              <>
                <span>•</span>
                <span className="text-primary font-semibold">{mediaInfo.label}</span>
              </>
            )}
          </div>

          {/* Video or Audio Embed */}
          {hasVideo && video ? (
            <div className="rounded-xl overflow-hidden bg-black border border-border shadow-inner">
              {mediaInfo?.provider === "twitter" ? (
                <div className="max-w-xl mx-auto py-2">
                  <UniversalVideoPlayer url={video.url} title={video.title || article.title} autoPlay={true} />
                </div>
              ) : (
                <div className="aspect-video w-full">
                  <UniversalVideoPlayer url={video.url} title={video.title || article.title} autoPlay={true} />
                </div>
              )}
            </div>
          ) : article.coverImage ? (
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-muted border border-border">
              <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
            </div>
          ) : null}

          {/* Content Body Text */}
          <div className="prose dark:prose-invert max-w-none font-sans text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line space-y-4 pt-2">
            {article.content || article.excerpt || "No additional text provided for this publication."}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-border bg-card/95 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="gap-1.5 text-xs"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Discussion ({showComments ? "Hide" : "Show"})</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={copyLink} className="gap-1.5 text-xs">
              <Share2 className="h-3.5 w-3.5" />
              <span>Share Link</span>
            </Button>
          </div>

          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
            Close Viewer
          </Button>
        </div>

        {/* Embedded Comments Section inside modal */}
        {showComments && (
          <div className="border-t border-border p-6 bg-muted/30">
            <CommentsSidebar articleId={article.id} onClose={() => setShowComments(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
