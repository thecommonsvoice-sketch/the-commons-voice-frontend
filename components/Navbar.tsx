"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/store/useUserStore";

// import { useCategoryStore } from "@/store/useCategoryStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, User, Settings, LogOut, ChevronDown, MoreHorizontal, Sparkles } from "lucide-react";
import LanguageSelector from "./LanguageSelector";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Static categories definitions
  const categories = [
    { name: "General", href: "/categories/general" },
    { name: "Politics", href: "/categories/politics" },
    { name: "Science and Technology", href: "/categories/science-and-technology" },
    { name: "Sports and Entertainment", href: "/categories/sports-and-entertainment" },
    { name: "Business", href: "/categories/business" },
    { name: "World", href: "/categories/world" },
    { name: "Defence", href: "/categories/defence" },
  ];

  /* 
  // Fetch categories only if not already available
  useEffect(() => {
    // Logic removed for static optimization
  }, []);
  */


  // Memoize visible and hidden categories
  const maxVisible = 7;
  const visibleCategories = useMemo(() => categories.slice(0, maxVisible), [categories]);
  const hiddenCategories = useMemo(() => categories.slice(maxVisible), [categories]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-2 sm:px-4">
          {/* Breaking news ticker */}
          {/* <div className="border-b border-red-600 bg-red-600 text-white py-1 px-2 text-[10px] sm:text-xs font-medium">
            <div className="animate-marquee whitespace-nowrap">
              🔴 BREAKING: Latest news updates • Stay informed with real-time reporting
            </div>
          </div> */}

          <nav className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="notranslate font-serif font-bold text-base sm:text-lg tracking-tight text-foreground/90 whitespace-nowrap" translate="no">The Commons Voice</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 2xl:space-x-6 min-w-0 overflow-hidden">
              <Link
                href="/subscribers"
                className="text-xs xl:text-sm font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap shrink-0"
              >
                Subscribers
              </Link>
              {categories.map((category, index) => {
                // Show top 4 categories on lg, top 5 on xl, all on 2xl
                const visibilityClass =
                  index < 3
                    ? "inline-block"
                    : index < 5
                    ? "hidden xl:inline-block"
                    : "hidden 2xl:inline-block";

                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    className={`text-xs xl:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors whitespace-nowrap ${visibilityClass}`}
                  >
                    {category.name}
                  </Link>
                );
              })}
              
              {/* More Dropdown for items hidden on smaller desktop screens */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1 text-xs xl:text-sm px-2 h-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span>More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {categories.map((category, index) => {
                    const dropdownVisibilityClass =
                      index < 3
                        ? "2xl:hidden"
                        : index < 5
                        ? "xl:hidden"
                        : "";

                    return (
                      <DropdownMenuItem asChild key={category.name} className={dropdownVisibilityClass}>
                        <Link href={category.href}>{category.name}</Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden md:inline text-xs sm:text-sm truncate max-w-[80px] lg:max-w-[100px] xl:max-w-[140px]">{user.name || user.email}</span>
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center text-sm">
                        <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {(user.role === "ADMIN" || user.role === "EDITOR" || user.role === "REPORTER") && (
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/${user.role.toLowerCase()}`} className="flex items-center text-sm">
                          <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          {user.role} Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 text-sm">
                      <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button variant="ghost" asChild size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild className="text-xs sm:text-sm px-2 sm:px-3">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 sm:h-10 sm:w-10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                {mobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </div>
          </nav>
          {/* Date & Language Selector below existing nav */}
          <div className="pb-2 flex items-center justify-between gap-4 text-[11px] sm:text-xs">
            {currentDate ? (
              <span className="text-muted-foreground font-medium">{currentDate}</span>
            ) : (
              <span />
            )}
            <div className="pr-1.5 sm:pr-3">
              <LanguageSelector />
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-3 sm:py-4 space-y-1 sm:space-y-2 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="pb-3 border-b mb-2 flex items-center justify-between gap-4">
                <div className="sm:hidden">
                  <ThemeToggle />
                </div>
              </div>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="block py-2 text-sm sm:text-base font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}