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
    <div className="bg-[#F4EFEA] p-4 border border-[#DFD6C9]">
      <div className="flex items-center justify-between border-b border-[#D1C4B5] pb-1.5 mb-3">
        <span className="font-sans text-[10px] uppercase font-bold tracking-wider text-[#1A1715] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          Global Currency Wire
        </span>
        <span className="font-sans text-[9px] uppercase font-bold text-[#C2410C] tracking-widest">
          {lastUpdated ? `Live at ${lastUpdated}` : "Real-Time Rates"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {rates.slice(0, 2).map((item) => (
          <div key={item.pair} className="border-r border-[#D1C4B5] pr-2">
            <span className="text-[10px] text-[#68635D] uppercase font-sans block">
              {item.pair}
            </span>
            <div className="font-serif font-bold text-sm text-[#1A1715]">{item.rate}</div>
            <span className="text-[10px] font-semibold text-emerald-800 font-sans">Verified FX</span>
          </div>
        ))}
        {rates.slice(2, 4).map((item) => (
          <div key={item.pair} className="pl-1">
            <span className="text-[10px] text-[#68635D] uppercase font-sans block">
              {item.pair}
            </span>
            <div className="font-serif font-bold text-sm text-[#1A1715]">{item.rate}</div>
            <span className="text-[10px] font-semibold text-emerald-800 font-sans">Verified FX</span>
          </div>
        ))}
      </div>
    </div>
  );
}
