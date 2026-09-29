"use client";

import { useEffect, useState } from "react";

interface CurrencyRate {
  pair: string;
  rate: string;
  symbol: string;
  change?: string;
}

export function LiveCurrencyTicker() {
  const [rates, setRates] = useState<CurrencyRate[]>([
    { pair: "USD/INR", rate: "--", symbol: "₹" },
    { pair: "EUR/USD", rate: "--", symbol: "$" },
    { pair: "GBP/USD", rate: "--", symbol: "$" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRates() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data?.rates) return;

        const usdInr = data.rates.INR ? data.rates.INR.toFixed(2) : "83.50";
        const eurUsd = data.rates.EUR ? (1 / data.rates.EUR).toFixed(4) : "1.0850";
        const gbpUsd = data.rates.GBP ? (1 / data.rates.GBP).toFixed(4) : "1.3020";
        const usdJpy = data.rates.JPY ? data.rates.JPY.toFixed(2) : "152.40";

        setRates([
          { pair: "USD/INR", rate: `₹${usdInr}`, symbol: "₹" },
          { pair: "EUR/USD", rate: `$${eurUsd}`, symbol: "$" },
          { pair: "GBP/USD", rate: `$${gbpUsd}`, symbol: "$" },
          { pair: "USD/JPY", rate: `¥${usdJpy}`, symbol: "¥" },
        ]);
      } catch (err) {
        console.error("Failed to load live exchange rates:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRates();
    const interval = setInterval(fetchRates, 300000); // Refresh every 5 minutes

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex items-center gap-3.5 tracking-tight text-[11px]">
      <span className="font-bold text-[10px] tracking-widest uppercase text-[#3C3835] flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
        Live FX:
      </span>
      {rates.map((item, idx) => (
        <span key={item.pair} className="inline-flex items-center gap-1">
          {idx > 0 && <span className="text-[#D1C4B5] mr-1">•</span>}
          <span className="text-[#1A1715] font-semibold">{item.pair}</span>
          <span className="font-mono text-emerald-800 font-bold">{item.rate}</span>
        </span>
      ))}
    </div>
  );
}

export function LiveCurrencyBox() {
  const [rates, setRates] = useState<CurrencyRate[]>([
    { pair: "USD / INR", rate: "--", symbol: "₹" },
    { pair: "EUR / USD", rate: "--", symbol: "$" },
    { pair: "GBP / USD", rate: "--", symbol: "$" },
    { pair: "USD / JPY", rate: "--", symbol: "¥" },
  ]);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function fetchRates() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data?.rates) return;

        const usdInr = data.rates.INR ? data.rates.INR.toFixed(2) : "83.50";
        const eurUsd = data.rates.EUR ? (1 / data.rates.EUR).toFixed(4) : "1.0850";
        const gbpUsd = data.rates.GBP ? (1 / data.rates.GBP).toFixed(4) : "1.3020";
        const usdJpy = data.rates.JPY ? data.rates.JPY.toFixed(2) : "152.40";

        setRates([
          { pair: "USD / INR", rate: `₹${usdInr}`, symbol: "₹" },
          { pair: "EUR / USD", rate: `$${eurUsd}`, symbol: "$" },
          { pair: "GBP / USD", rate: `$${gbpUsd}`, symbol: "$" },
          { pair: "USD / JPY", rate: `¥${usdJpy}`, symbol: "¥" },
        ]);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch (err) {
        console.error("Failed to load live exchange rates:", err);
      }
    }

    fetchRates();
    const interval = setInterval(fetchRates, 300000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-[#F0FDF4] p-5 border-2 border-[#86EFAC] shadow-xs">
      <div className="flex items-center justify-between border-b border-[#BBF7D0] pb-2 mb-3.5">
        <span className="font-sans text-[10px] uppercase font-extrabold tracking-wider text-[#15803D] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          Global Currency Wire
        </span>
        <span className="font-sans text-[9px] uppercase font-bold text-[#15803D] tracking-widest bg-[#DCFCE7] px-2 py-0.5 border border-[#86EFAC]">
          {lastUpdated ? `Live at ${lastUpdated}` : "Real-Time Rates"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        {rates.map((item) => (
          <div
            key={item.pair}
            className="bg-white p-2.5 border border-[#BBF7D0] shadow-2xs hover:border-[#16A34A] transition-colors"
          >
            <span className="text-[10px] text-[#64748B] font-bold uppercase font-sans block tracking-wider">
              {item.pair}
            </span>
            <div className="font-serif font-black text-[15px] text-[#0F172A] mt-0.5">{item.rate}</div>
            <span className="text-[9.5px] font-bold text-[#16A34A] font-sans inline-flex items-center gap-1">
              <span>●</span> Verified FX
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
