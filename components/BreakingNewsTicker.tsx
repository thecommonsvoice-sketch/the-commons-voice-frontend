"use client";
import { useEffect, useRef } from "react";

interface BreakingNewsTickerProps {
  headlines: string[];
}

export function BreakingNewsTicker({ headlines }: BreakingNewsTickerProps) {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tickerRef.current) {
      tickerRef.current.scrollLeft = 0;
    }
  }, [headlines]);

  if (!headlines.length) return null;

  return (
    <div className="bg-red-600 text-white py-2 px-4 overflow-hidden whitespace-nowrap">
      <strong className="mr-4">Breaking:</strong>
      <div
        ref={tickerRef}
        className="inline-block animate-marquee"
        style={{ animation: "marquee 15s linear infinite" }}
      >
        {headlines.map((h, i) => (
          <span key={i} className="mx-6">{h}</span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(100%); }
          to { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
