"use client";

import { useState } from "react";
import Image from "next/image";
import { Volume2, Video, Play, ExternalLink } from "lucide-react";

interface UniversalVideoPlayerProps {
  url: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
}

export interface ParsedMedia {
  provider: "youtube" | "twitter" | "vimeo" | "dailymotion" | "audio" | "direct_video" | "iframe";
  embedUrl: string;
  label: string;
}

export function parseMediaUrl(url: string): ParsedMedia {
  if (!url) {
    return { provider: "iframe", embedUrl: "", label: "Media Stream" };
  }

  const cleanUrl = url.trim();

  // 1. Audio file check
  if (
    cleanUrl.match(/\.(mp3|wav|m4a|aac|ogg)(\?.*)?$/i) ||
    cleanUrl.toLowerCase().includes("audio")
  ) {
    return { provider: "audio", embedUrl: cleanUrl, label: "Voice Note / Audio" };
  }

  // 2. YouTube check (standard watch, shorts, share links, embed URLs)
  const ytMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      label: "YouTube Video",
    };
  }

  // 3. Twitter / X Post Video check
  const twitterMatch = cleanUrl.match(/(?:twitter\.com|x\.com)\/(?:[^\/]+)\/status\/(\d+)/i);
  if (twitterMatch && twitterMatch[1]) {
    return {
      provider: "twitter",
      embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${twitterMatch[1]}&theme=dark`,
      label: "Twitter / X Post Video",
    };
  }

  // 4. Vimeo check
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:.*\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      label: "Vimeo Video",
    };
  }

  // 5. DailyMotion check
  const dmMatch = cleanUrl.match(/dailymotion\.com\/video\/([kK][a-zA-Z0-9]+)/i);
  if (dmMatch && dmMatch[1]) {
    return {
      provider: "dailymotion",
      embedUrl: `https://www.dailymotion.com/embed/video/${dmMatch[1]}`,
      label: "DailyMotion Video",
    };
  }

  // 6. Direct Video File (.mp4, .webm, .mov, Cloudinary, AWS S3)
  if (
    cleanUrl.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) ||
    cleanUrl.includes("res.cloudinary.com") ||
    cleanUrl.includes("amazonaws.com")
  ) {
    return { provider: "direct_video", embedUrl: cleanUrl, label: "Direct MP4 Video Stream" };
  }

  // Default fallback for any embedded web URL
  return { provider: "iframe", embedUrl: cleanUrl, label: "Web Video Embed" };
}

export interface MediaThumbnail {
  type: "image" | "video_frame" | "twitter" | "audio" | "fallback";
  src: string;
}

export function getMediaThumbnail(url: string, coverImage?: string | null): MediaThumbnail {
  if (coverImage && coverImage.trim()) {
    return { type: "image", src: coverImage.trim() };
  }

  if (!url) {
    return { type: "fallback", src: "" };
  }

  const { provider } = parseMediaUrl(url);

  if (provider === "youtube") {
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return { type: "image", src: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg` };
    }
  }

  if (provider === "direct_video") {
    if (url.includes("res.cloudinary.com")) {
      const jpgUrl = url.replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, ".jpg");
      return { type: "image", src: jpgUrl };
    }
    return { type: "video_frame", src: `${url.split("#")[0]}#t=0.5` };
  }

  if (provider === "twitter") {
    return { type: "twitter", src: url };
  }

  if (provider === "audio") {
    return { type: "audio", src: url };
  }

  return { type: "fallback", src: "" };
}

export function VideoThumbnailPreview({
  url,
  coverImage,
  title,
  className = "w-full h-full",
}: {
  url: string;
  coverImage?: string | null;
  title?: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);
  const thumb = getMediaThumbnail(url, coverImage);

  if (thumb.type === "image" && thumb.src && !imgError) {
    return (
      <Image
        src={thumb.src}
        alt={title || "Video thumbnail"}
        fill
        onError={() => setImgError(true)}
        className={`object-cover transition-transform duration-500 group-hover:scale-105 ${className}`}
      />
    );
  }

  if (thumb.type === "video_frame" && thumb.src) {
    return (
      <video
        src={thumb.src}
        preload="metadata"
        muted
        playsInline
        className={`w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105 bg-black ${className}`}
      />
    );
  }

  if (thumb.type === "twitter") {
    return (
      <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-black p-4 text-white">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-bold text-sky-400">🐦 Twitter / X Video</span>
          <span className="text-[10px] bg-sky-950/80 text-sky-300 border border-sky-800 px-2 py-0.5 rounded font-mono">
            Drop
          </span>
        </div>
        <p className="font-serif text-sm font-semibold line-clamp-2 text-slate-100">
          {title || "Twitter Media Drop"}
        </p>
        <div className="text-[11px] text-sky-400 font-medium">Tap to Stream Video ▶</div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-black text-muted-foreground">
      <Video className="h-10 w-10 text-primary/70" />
    </div>
  );
}

export function UniversalVideoPlayer({
  url,
  title,
  autoPlay = true,
  className = "w-full h-full",
}: UniversalVideoPlayerProps) {
  const { provider, embedUrl } = parseMediaUrl(url);

  if (provider === "audio") {
    return (
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-primary uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Volume2 className="h-4 w-4" /> Exclusive Audio / Voice Note
          </span>
        </div>
        <audio controls src={embedUrl} autoPlay={autoPlay} className="w-full h-10 rounded" />
      </div>
    );
  }

  if (provider === "direct_video") {
    return (
      <video
        src={embedUrl}
        controls
        autoPlay={autoPlay}
        playsInline
        className={`object-contain bg-black ${className}`}
      />
    );
  }

  if (provider === "youtube" || provider === "vimeo" || provider === "dailymotion") {
    return (
      <iframe
        src={embedUrl}
        title={title || "Video Player"}
        className={`border-0 ${className}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (provider === "twitter") {
    return (
      <div className="w-full h-full min-h-[420px] bg-black/90 flex items-center justify-center rounded-lg overflow-hidden border border-border p-2">
        <iframe
          src={embedUrl}
          title={title || "Embedded Tweet Video"}
          className="w-full h-[450px] border-0 rounded-lg"
          allow="autoplay; encrypted-media"
        />
      </div>
    );
  }

  // Fallback IFrame / Web URL
  return (
    <iframe
      src={embedUrl}
      title={title || "Media Embed"}
      className={`border-0 ${className}`}
      allow="autoplay; encrypted-media"
      allowFullScreen
    />
  );
}
