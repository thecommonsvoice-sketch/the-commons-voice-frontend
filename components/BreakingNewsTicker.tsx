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
    <div className="w-full border-t border-b border-[#FCD34D] bg-[#FFFBEB] text-[#1A1715] h-9">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 h-full flex items-center gap-3 overflow-hidden whitespace-nowrap font-sans text-xs">
        <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-0.5 bg-[#DC2626] text-white font-sans text-[10px] font-extrabold uppercase tracking-widest rounded-none shadow-xs">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
          </span>
          <span>Live Wire</span>
        </div>
        <div className="overflow-hidden flex-1 text-xs font-serif italic text-[#1A1715]">
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
                <span key={i} className="mx-6 inline-block hover:text-[#DC2626] hover:underline cursor-pointer">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="ml-auto shrink-0 hidden md:inline font-sans text-[11px] text-[#68635D]">
          Updated Wire
        </span>
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
