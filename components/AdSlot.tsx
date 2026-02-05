"use client";
import { useEffect, useRef } from "react";

interface AdSlotProps {
  slot: string; // The ad slot ID from AdSense
  className?: string;
  format?: "auto" | "fluid" | "rectangle";
  responsive?: boolean;
  style?: React.CSSProperties;
}

export function AdSlot({
  slot,
  className,
  format = "auto",
  responsive = true,
  style,
}: AdSlotProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      // Check if window.adsbygoogle exists and push the ad
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  const client = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  if (!client) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className={`bg-gray-100 border p-4 text-center text-xs text-gray-500 ${className}`}>
          <p>AdSense Client ID missing.</p>
          <p>Slot: {slot}</p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`ad-container ${className || ""}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
