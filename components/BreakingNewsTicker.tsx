"use client";
import { useEffect, useRef, useState } from "react";
import { Oxanium } from "next/font/google";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

type IArticle = {
  id: string;
  title: string;
  photoUrl: string;
  link: string;
  description: string;
};

export function BreakingNewsTicker() {
  const [headlines, setHeadlines] = useState<string[]>([]);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(60); // default fallback

  useEffect(() => {
    const fetchHeadlines = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
        const res = await fetch(`${base}/news`);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data)
          ? data.map((a: IArticle) => `${a.title} ${a.description || ""}`)
          : [];
      } catch (err) {
        console.error(err);
        return [];
      }
    };

    fetchHeadlines().then(setHeadlines);
  }, []);

  useEffect(() => {
    if (!marqueeRef.current) return;

    const el = marqueeRef.current;
    const totalWidth = el.scrollWidth;

    const calculateSpeed = () => {
      const screenWidth = window.innerWidth;
      // slower on small screens
      if (screenWidth < 640) return 80; // pixels per second for mobile
      if (screenWidth < 1024) return 120; // pixels per second for tablets
      return 200; // default for desktop
    };

    const speed = calculateSpeed();
    const newDuration = totalWidth / speed;

    setDuration(newDuration);
  }, [headlines]);

  const repeated = [...headlines, ...headlines];

  return (
    <div
      className={`bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white h-10 px-4 overflow-hidden whitespace-nowrap flex items-center gap-3 shadow-xs ${oxanium.className}`}
    >
      <div className="flex-shrink-0 flex items-center gap-2 bg-black/20 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span>Breaking News</span>
      </div>
      <div className="overflow-hidden flex-1 text-sm font-medium text-white/95">
        {headlines.length > 0 && (
          <div
            ref={marqueeRef}
            className="inline-block"
            style={{
              display: "inline-block",
              animation: `marquee ${duration}s linear infinite`,
            }}
          >
            {repeated.map((h, i) => (
              <span key={i} className="mx-6 inline-block hover:underline cursor-pointer">
                {h}
              </span>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
