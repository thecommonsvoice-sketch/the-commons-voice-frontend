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

  if (!headlines.length) return null;

  const repeated = [...headlines, ...headlines];

  return (
    <div
      className={`bg-red-600 text-white py-2 px-4 overflow-hidden whitespace-nowrap flex items-center gap-4 ${oxanium.className}`}
    >
      <strong className="flex-shrink-0">Breaking:</strong>
      <div className="overflow-hidden flex-1">
        <div
          ref={marqueeRef}
          className="inline-block"
          style={{
            display: "inline-block",
            animation: `marquee ${duration}s linear infinite`,
          }}
        >
          {repeated.map((h, i) => (
            <span key={i} className="mx-6 inline-block">
              {h}
            </span>
          ))}
        </div>
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
