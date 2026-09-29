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
        className="w-full border border-slate-700 bg-slate-900/90 text-white placeholder-slate-400 px-3 py-2.5 text-xs font-sans focus:outline-none focus:border-[#F59E0B] rounded-none text-center"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white font-sans text-xs font-bold uppercase tracking-widest py-2.5 rounded-none shadow-sm transition-colors cursor-pointer"
      >
        {loading ? "Registering..." : "Subscribe Complimentary"}
      </button>
    </form>
  );
}
