"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Share2, Calendar, User, Tag, MessageSquare, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UniversalVideoPlayer, parseMediaUrl } from "@/components/UniversalVideoPlayer";
import type { Article } from "@/lib/types";
import { toast } from "sonner";
import { CommentsSidebar } from "@/components/CommentSidebar";

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
    toast.success("Dispatch link copied to clipboard!");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs"
        />

        {/* Modal Card Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl text-foreground my-auto flex flex-col"
        >
          {/* Header Bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/95 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest">
                <ShieldCheck className="h-3 w-3" /> Insider Dispatch File
              </span>
              {article.category && (
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded font-medium border border-border/50">
                  {article.category.name}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Modal Body Content */}
          <div className="p-6 sm:p-8 space-y-6 flex-1">
            {/* Dispatch Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground leading-tight tracking-tight">
              {article.title}
            </h2>

            {/* Reporter & Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-b border-border/60 pb-4">
              <span className="flex items-center gap-1.5 font-medium text-foreground">
                <User className="h-3.5 w-3.5 text-primary" />
                {article.author?.name || "TCV Investigative Desk"}
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

            {/* Embedded Media Stream */}
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

            {/* Dispatch Body Content */}
            <div className="prose max-w-none font-sans text-sm sm:text-base leading-relaxed text-foreground/90 whitespace-pre-line space-y-4 pt-2">
              {article.content || article.excerpt || "No additional text content logged for this dispatch file."}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-border bg-card/95 px-6 py-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="gap-1.5 text-xs font-semibold"
              >
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                <span>Subscriber Discussion ({showComments ? "Hide" : "Show"})</span>
              </Button>

              <Button variant="ghost" size="sm" onClick={copyLink} className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Link</span>
              </Button>
            </div>

            <Button variant="secondary" size="sm" onClick={onClose} className="text-xs font-medium">
              Close File
            </Button>
          </div>

          {/* Comments Sidebar */}
          {showComments && (
            <div className="border-t border-border p-6 bg-muted/20">
              <CommentsSidebar articleId={article.id} onClose={() => setShowComments(false)} />
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
