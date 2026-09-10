"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, animate } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Radio,
  FileText,
  Video,
  Headphones,
  ChevronDown,
} from "lucide-react";

interface SubscriberMastheadProps {
  isSubscriber: boolean | null;
  expiresAt: string | null;
  totalDispatches: number;
  totalVideos: number;
  unlockSlot?: React.ReactNode;
}

function AnimatedCounter({ target, duration = 1.8 }: { target: number; duration?: number }) {
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      ease: [0.25, 0.4, 0.25, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [target, duration, count]);

  return <span>{display}</span>;
}

export function SubscriberMasthead({
  isSubscriber,
  expiresAt,
  totalDispatches,
  totalVideos,
  unlockSlot,
}: SubscriberMastheadProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.55, 0.85]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const scaleVal = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div ref={ref} className="relative overflow-hidden min-h-[460px] flex items-center justify-center">
      {/* Parallax Background Image */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ y: bgY, scale: scaleVal }}
      >
        <img
          src="/images/subscriber-hero-bg.png"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: overlayOpacity,
          background:
            "linear-gradient(180deg, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.75) 50%, rgba(10,10,10,0.96) 100%)",
        }}
      />

      {/* Subtle Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Content Container */}
      <motion.div
        className="relative z-10 container mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center text-center"
        style={{ y: textY }}
      >
        {/* Top Dateline / Press Seal */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="h-px w-10 bg-white/25" />
          <span className="text-[11px] font-bold text-white/60 uppercase tracking-[0.25em] font-mono">
            The Commons Voice — Insider Bureau
          </span>
          <div className="h-px w-10 bg-white/25" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] max-w-3xl"
        >
          Restricted Dispatches
          <br />
          <span className="text-white/50">&amp; Media Vault</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-3 max-w-xl text-xs sm:text-base text-white/60 leading-relaxed"
        >
          Unedited video drops, reporter voice notes, and investigative files
          reserved exclusively for verified members.
        </motion.p>

        {/* Live Stats / Feature Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-3"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm text-xs font-medium text-white/75">
            <FileText className="h-3.5 w-3.5 text-amber-400/80" />
            {isSubscriber ? (
              <>
                <AnimatedCounter target={totalDispatches} /> Dispatches
              </>
            ) : (
              <span>Exclusive Dispatches</span>
            )}
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm text-xs font-medium text-white/75">
            <Video className="h-3.5 w-3.5 text-blue-400/80" />
            {isSubscriber ? (
              <>
                <AnimatedCounter target={totalVideos} /> Video Drops
              </>
            ) : (
              <span>Media Vault</span>
            )}
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm text-xs font-medium text-white/75">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Live Feed
          </div>
        </motion.div>

        {/* Embedded Above-The-Fold Unlock Slot or Member Access Badge */}
        {isSubscriber ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-6"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-5 py-2.5 text-xs sm:text-sm font-semibold text-emerald-300 backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Member Access Granted</span>
              {expiresAt && (
                <span className="text-emerald-300/60 border-l border-emerald-500/25 pl-2.5 ml-1 text-[11px] font-normal">
                  Expires {formatDate(expiresAt)}
                </span>
              )}
            </div>
          </motion.div>
        ) : unlockSlot ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-6 w-full max-w-md"
          >
            {unlockSlot}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="mt-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-xs sm:text-sm font-medium text-white/60 backdrop-blur-sm">
              <Lock className="h-4 w-4 text-amber-400/70" />
              <span>Subscriber passcode required to unlock</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
