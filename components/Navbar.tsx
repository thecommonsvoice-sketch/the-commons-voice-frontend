"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  MoreHorizontal,
  Search,
  Calendar,
  Newspaper,
} from "lucide-react";
import LanguageSelector from "./LanguageSelector";
import { LiveCurrencyTicker } from "./LiveCurrencyTicker";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { user, clearUser } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("en-US", options));
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("tcv_token");
      }
      clearUser();
      router.replace("/");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/articles?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const categories = [
    { name: "General", href: "/categories/general" },
    { name: "Politics", href: "/categories/politics" },
    { name: "Science & Technology", href: "/categories/science-and-technology" },
    { name: "Sports & Entertainment", href: "/categories/sports-and-entertainment" },
    { name: "Business", href: "/categories/business" },
    { name: "World", href: "/categories/world" },
    { name: "Defence", href: "/categories/defence" },
  ];

  const maxVisible = 6;
  const visibleCategories = useMemo(() => categories.slice(0, maxVisible), [categories]);
  const hiddenCategories = useMemo(() => categories.slice(maxVisible), [categories]);

  return (
    <>
      {/* TOP BROADSHEET TICKER: DATE, REAL LIVE CURRENCIES, LANGUAGE */}
      <aside className="w-full bg-[#F3ECE3] border-b border-[#E2D9CE] text-[#68635D] text-[11px] font-sans">
        <div className="max-w-[1380px] mx-auto px-3 sm:px-6 md:px-8 py-1.5 flex flex-wrap items-center justify-between gap-y-1.5">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-[#1A1715]">
              <Calendar className="w-3.5 h-3.5 text-[#C2410C]" />
              {currentDate || "The Commons Voice Wire"}
            </span>
            <span className="text-[#D1C4B5]">|</span>
            <span className="font-medium tracking-wide text-[#3C3835]">
              Independent Journalism &amp; Public Record
            </span>
          </div>

          {/* Real Live Currency Rates */}
          <div className="hidden lg:flex items-center gap-3.5 tracking-tight text-[11px]">
            <LiveCurrencyTicker />
          </div>

          {/* Language selector, Contact & Edition */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0">
            <Link
              href="/contact"
              className="hidden sm:inline text-[11px] font-semibold text-[#3C3835] hover:text-[#C2410C] transition-colors"
            >
              Contact Desk
            </Link>
            <span className="hidden sm:inline text-[#D1C4B5]">|</span>
            <span className="hidden md:inline text-[10px] uppercase font-bold text-[#68635D] tracking-wider">
              Edition: <span className="text-[#1A1715]">Global</span>
            </span>
            <div className="scale-90 origin-right">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN BROADSHEET MASTHEAD */}
      <header className="w-full bg-[#FAF7F2] border-b border-[#E2D9CE]">
        <div className="max-w-[1380px] mx-auto px-3 sm:px-6 md:px-8 pt-3 sm:pt-4 pb-2">
          {/* Header Top Row */}
          <div className="flex items-center justify-between gap-4 border-b border-[#E2D9CE] pb-3 sm:pb-4">
            {/* Desktop Left: Search Form */}
            <div className="w-1/4 hidden lg:flex items-center">
              <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#68635D]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dispatches..."
                  className="w-full pl-8 pr-12 py-1 text-xs font-sans bg-[#F5EFEB] border border-[#E2D9CE] text-[#1A1715] placeholder-[#68635D] focus:outline-none focus:border-[#1A1715] rounded-none"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-sans font-bold text-[#68635D] bg-[#ECE4DB] px-1 py-0.2 border border-[#D1C4B5]">
                  ↵
                </span>
              </form>
            </div>

            {/* Mobile Left: Drawer & Search Button */}
            <div className="flex lg:hidden items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#1A1715] hover:bg-[#F5EFEB] rounded-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-[#1A1715] hover:bg-[#F5EFEB] rounded-none"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                aria-label="Toggle search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Center: Authoritative Broadsheet Nameplate */}
            <div className="text-center flex-1 min-w-0">
              <Link href="/" className="inline-block group py-1">
                <span className="font-masthead text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-black tracking-tight text-[#1A1715] uppercase leading-none block group-hover:text-[#C2410C] transition-colors">
                  The Commons Voice
                </span>
                <span className="font-sans text-[8px] sm:text-[9.5px] md:text-[11px] font-bold tracking-[0.20em] sm:tracking-[0.25em] text-[#68635D] uppercase block mt-1">
                  The Independent International Journal of Record &amp; Critical Inquiry
                </span>
              </Link>
            </div>

            {/* Right: Auth & Subscription */}
            <div className="w-auto lg:w-1/4 flex items-center justify-end gap-2 sm:gap-3 font-sans text-xs shrink-0">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1.5 text-xs font-sans font-semibold text-[#1A1715] hover:bg-[#F5EFEB] px-2.5 py-1.5 h-auto rounded-none border border-[#E2D9CE]"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline truncate max-w-[100px]">{user.name || user.email}</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 rounded-none bg-[#FAF7F2] border border-[#E2D9CE]">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center text-xs font-sans font-medium">
                        <User className="mr-2 h-3.5 w-3.5" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {(user.role === "ADMIN" || user.role === "EDITOR" || user.role === "REPORTER") && (
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/${user.role.toLowerCase()}`} className="flex items-center text-xs font-sans font-medium">
                          <Settings className="mr-2 h-3.5 w-3.5" />
                          {user.role} Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#E2D9CE]" />
                    <DropdownMenuItem onClick={logout} className="text-[#BA1A1A] text-xs font-sans font-medium">
                      <LogOut className="mr-2 h-3.5 w-3.5" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="font-sans text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1A1715] hover:text-[#C2410C] px-2 py-1 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="hidden sm:inline-flex items-center gap-1 bg-[#1A1715] hover:bg-[#C2410C] text-[#FAF7F2] px-3 py-1.5 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors rounded-none"
                  >
                    <span>Subscribe</span>
                    <span className="text-amber-300 font-sans text-[10px]">£2/wk</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Expandable Bar */}
          {mobileSearchOpen && (
            <div className="lg:hidden py-2 border-b border-[#E2D9CE]">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#68635D]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dispatches, archives..."
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 text-xs font-sans bg-[#F5EFEB] border border-[#E2D9CE] text-[#1A1715] placeholder-[#68635D] focus:outline-none focus:border-[#1A1715] rounded-none"
                />
              </form>
            </div>
          )}

          {/* NAVIGATION BAND BETWEEN DOUBLE RULES */}
          <nav className="pt-2 pb-1.5 mt-1 border-t-[3px] border-[#1A1715] border-double flex flex-col md:flex-row items-center justify-between gap-y-2 font-sans text-xs tracking-wider uppercase font-semibold">
            {/* Desktop Categories */}
            <div className="hidden lg:flex flex-wrap items-center justify-center gap-x-6 xl:gap-x-8 gap-y-1 text-[#3C3835]">
              <Link
                href="/"
                className={`transition-colors pb-0.5 ${
                  pathname === "/"
                    ? "text-[#C2410C] font-bold border-b-2 border-[#C2410C]"
                    : "hover:text-[#1A1715]"
                }`}
              >
                Home
              </Link>
              {visibleCategories.map((category) => {
                const isActive = pathname === category.href;
                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={`transition-colors pb-0.5 whitespace-nowrap ${
                      isActive
                        ? "text-[#C2410C] font-bold border-b-2 border-[#C2410C]"
                        : "hover:text-[#1A1715]"
                    }`}
                  >
                    {category.name}
                  </Link>
                );
              })}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 hover:text-[#1A1715] text-xs uppercase tracking-wider font-semibold cursor-pointer py-1">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                    <span>More</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 bg-[#FAF7F2] border border-[#1A1715] rounded-none p-1.5 shadow-lg space-y-1 z-50"
                >
                  {/* Option to see the /articles page */}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/articles"
                      className={`flex items-center justify-between text-xs font-sans font-bold uppercase tracking-wider px-2.5 py-2 cursor-pointer transition-colors ${
                        pathname === "/articles"
                          ? "bg-[#1A1715] text-[#FAF7F2]"
                          : "text-[#C2410C] hover:bg-[#F3ECE3]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Newspaper className="w-3.5 h-3.5" />
                        <span>All Dispatches</span>
                      </span>
                      <span className="text-[10px] text-[#68635D] font-normal">/articles</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Option to see the /categories section index */}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/categories"
                      className={`flex items-center justify-between text-xs font-sans font-semibold uppercase tracking-wider px-2.5 py-1.5 cursor-pointer transition-colors ${
                        pathname === "/categories"
                          ? "bg-[#1A1715] text-[#FAF7F2]"
                          : "text-[#1A1715] hover:bg-[#F3ECE3]"
                      }`}
                    >
                      <span>Section Index</span>
                      <span className="text-[#68635D]">→</span>
                    </Link>
                  </DropdownMenuItem>

                  {hiddenCategories.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-[#E2D9CE] my-1" />
                      <div className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-widest text-[#68635D]">
                        Additional Desks
                      </div>
                      {hiddenCategories.map((cat) => (
                        <DropdownMenuItem asChild key={cat.name}>
                          <Link
                            href={cat.href}
                            className={`flex items-center justify-between text-xs font-sans font-medium uppercase tracking-wider px-2.5 py-1.5 cursor-pointer transition-colors ${
                              pathname === cat.href
                                ? "bg-[#1A1715] text-[#FAF7F2]"
                                : "text-[#1A1715] hover:bg-[#F3ECE3]"
                            }`}
                          >
                            <span>{cat.name}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile Horizontal Scrolling Categories Ribbon */}
            <div className="flex lg:hidden items-center gap-3 overflow-x-auto w-full no-scrollbar pb-1 text-[11px] font-semibold">
              <Link
                href="/"
                className={`whitespace-nowrap px-2.5 py-0.5 ${
                  pathname === "/"
                    ? "bg-[#1A1715] text-[#FAF7F2]"
                    : "bg-[#F5EFEB] text-[#1A1715] border border-[#E2D9CE]"
                }`}
              >
                Home
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={`whitespace-nowrap px-2.5 py-0.5 ${
                    pathname === cat.href
                      ? "bg-[#1A1715] text-[#FAF7F2]"
                      : "bg-[#F5EFEB] text-[#1A1715] border border-[#E2D9CE]"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* Right side Contact Us & Section Index links */}
            <div className="hidden lg:flex items-center gap-3.5 text-xs text-[#68635D] font-normal normal-case">
              <Link
                href="/contact"
                className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-sans font-bold transition-colors ${
                  pathname === "/contact"
                    ? "text-[#C2410C] border-b-2 border-[#C2410C] pb-0.5"
                    : "text-[#68635D] hover:text-[#C2410C]"
                }`}
              >
                <span>Contact Us</span>
              </Link>
              <span className="text-[#D1C4B5]">|</span>
              <Link
                href="/categories"
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-sans font-semibold text-[#68635D] hover:text-[#1A1715] transition-colors"
              >
                <span>Section Index</span>
                <span>→</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Mobile Full Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2D9CE] bg-[#FAF7F2] px-4 py-4 space-y-3 font-sans">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#68635D] border-b border-[#E2D9CE] pb-1.5">
              Broadsheet Sections
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/"
                className="py-1.5 text-xs font-semibold text-[#1A1715] hover:text-[#C2410C]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Front Page (Home)
              </Link>
              <Link
                href="/articles"
                className="py-1.5 text-xs font-bold text-[#C2410C] hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Dispatches Archive →
              </Link>
              <Link
                href="/categories"
                className="py-1.5 text-xs font-semibold text-[#1A1715] hover:text-[#C2410C]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Section Index (Directory)
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="py-1.5 text-xs font-semibold text-[#1A1715] hover:text-[#C2410C]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <div className="pt-3 border-t border-[#E2D9CE] flex items-center justify-between">
              <Link
                href="/about"
                className="text-xs text-[#68635D] hover:text-[#1A1715]"
                onClick={() => setMobileMenuOpen(false)}
              >
                About The Broadsheet
              </Link>
              <Link
                href="/contact"
                className="text-xs font-bold text-[#C2410C] hover:underline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us &amp; Newsroom →
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}