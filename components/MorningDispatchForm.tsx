"use client";

import { useState } from "react";
import { toast } from "sonner";

export function MorningDispatchForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid dispatch address");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEmail("");
      toast.success("Subscribed to The Morning Dispatch telegram");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 pt-1">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@organization.com"
        className="w-full border border-[#D1C4B5] bg-white px-3 py-2 text-xs font-sans text-[#1A1715] placeholder-[#68635D] focus:outline-none focus:border-[#1A1715] rounded-none text-center"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 text-white font-sans text-xs font-bold uppercase tracking-widest py-2.5 rounded-none shadow-xs transition-colors"
      >
        {loading ? "Registering..." : "Subscribe Complimentary"}
      </button>
    </form>
  );
}
