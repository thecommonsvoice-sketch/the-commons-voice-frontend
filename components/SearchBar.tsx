"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  defaultValue?: string;
  /** Base path for navigation, defaults to /articles */
  basePath?: string;
}

export function SearchBar({
  placeholder = "Search articles…",
  defaultValue = "",
  basePath = "/articles",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultValue);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const navigate = useCallback(
    (searchTerm: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      if (searchTerm.trim()) {
        params.set("q", searchTerm.trim());
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      router.push(`${basePath}?${params.toString()}`);
    },
    [router, searchParams, basePath]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query);
  };

  const handleClear = () => {
    setQuery("");
    navigate("");
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-lg group">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#68635D] group-focus-within:text-[#C2410C] transition-colors pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded-none border border-[#1A1715] bg-[#FAF7F2] pl-10 pr-10 text-xs sm:text-sm text-[#1A1715] placeholder:text-[#8C827A] focus:outline-none focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] transition-all font-sans"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-none hover:bg-[#EAE2D8] flex items-center justify-center transition-colors text-[#68635D] hover:text-[#1A1715]"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );
}
