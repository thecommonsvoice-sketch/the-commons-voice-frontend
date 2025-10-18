"use client";
import { useEffect, useState } from "react";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'], // You can adjust weights
  display: 'swap',
});

type IArticle = {
   
        id: string,
        title: string,
        photoUrl: string,
        link: string,
        description: string,
    
}

export function BreakingNewsTicker() {
  const [headlines, setHeadlines] = useState<string[]>([]);

  useEffect(() => {
    // const controller = new AbortController();

    const fetchHeadlines = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
        const res = await fetch(`${base}/news`);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data.map((a:IArticle) => a.description) : [];
   
      } catch (err) {
        if (err) return [];
        return [];
      }
    };

    fetchHeadlines().then(setHeadlines);

    // return () => controller.abort();
  }, []);

  if (!headlines.length) return null;

  // duplicate headlines so the marquee appears continuous
  const repeated = [...headlines, ...headlines];

  return (
    <div className={`bg-red-600 text-white py-2 px-4 overflow-hidden whitespace-nowrap ${openSans.className} `}>
      <strong className="mr-4">Breaking:</strong>
      <div
        className="inline-block"
        style={{ display: "inline-block", animation: "marquee 600s linear infinite" }}
      >
        {repeated.map((h, i) => (
          <span key={i} className="mx-6 inline-block">{h}</span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0%); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
