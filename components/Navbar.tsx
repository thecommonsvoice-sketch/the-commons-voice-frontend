"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, User, Settings, LogOut, ChevronDown, MoreHorizontal } from "lucide-react";
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
  const { categories, setCategories } = useCategoryStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    } finally {
      clearUser();
      router.replace("/");
    }
  };

  // Fetch categories only if not already available
  useEffect(() => {
    const fetchCategories = async () => {
      if (categories.length > 0) {
        return; // Categories are already cached
      }
      try {
        const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
        const res = await fetch(`${base}/categories`, {
          next: { revalidate: 600 }, // Cache and revalidate every 600 seconds
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.statusText}`);
        }

        const data = await res.json();

        const fetchedCategories = data?.categories.map((cat: { name: string; slug: string }) => ({
          name: cat.name,
          href: `/categories/${cat.slug}`,
        })) || [];

        setCategories(fetchedCategories); // Store categories in global state
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, [categories, setCategories]);

  // Memoize visible and hidden categories
  const maxVisible = 5;
  const visibleCategories = useMemo(() => categories.slice(0, maxVisible), [categories]);
  const hiddenCategories = useMemo(() => categories.slice(maxVisible), [categories]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-2 sm:px-4">
          {/* Breaking news ticker */}
          <div className="border-b border-red-600 bg-red-600 text-white py-1 px-2 text-[10px] sm:text-xs font-medium">
            <div className="animate-marquee whitespace-nowrap">
              🔴 BREAKING: Latest news updates • Stay informed with real-time reporting
            </div>
          </div>

          <nav className="flex h-14 sm:h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <div className="h-7 w-7 sm:h-8 sm:w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm">
                TCV
              </div>
              <span className="font-bold text-sm sm:text-base md:text-xl">The Commons Voice</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-6">
              {visibleCategories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-xs xl:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap"
                >
                  {category.name}
                </Link>
              ))}
              {hiddenCategories.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1 text-xs xl:text-sm px-2">
                      <MoreHorizontal className="h-3 w-3 xl:h-4 xl:w-4" />
                      <span className="hidden xl:inline">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {hiddenCategories.map((category) => (
                      <DropdownMenuItem asChild key={category.name}>
                        <Link href={category.href}>{category.name}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm px-2 sm:px-3">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden md:inline text-xs sm:text-sm truncate max-w-[100px]">{user.name || user.email}</span>
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
              >
                {mobileMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-3 sm:py-4 space-y-1 sm:space-y-2 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="sm:hidden pb-3 border-b mb-2">
                <ThemeToggle />
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