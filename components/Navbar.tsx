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
        <div className="container mx-auto px-4">
          {/* Breaking news ticker */}
          <div className="border-b border-red-600 bg-red-600 text-white py-1 px-2 text-xs font-medium">
            <div className="animate-marquee whitespace-nowrap">
              🔴 BREAKING: Latest news updates • Stay informed with real-time reporting
            </div>
          </div>

          <nav className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-sm">
                TCV
              </div>
              <span className="font-bold text-md sm:text-xl">The Commons Voice</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {visibleCategories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {category.name}
                </Link>
              ))}
              {hiddenCategories.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1">
                      <MoreHorizontal className="h-4 w-4" />
                      <span>More</span>
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
            <div className="flex items-center space-x-2">
              <ThemeToggle />

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.name || user.email}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {(user.role === "ADMIN" || user.role === "EDITOR" || user.role === "REPORTER") && (
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/${user.role.toLowerCase()}`} className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          {user.role} Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="block py-2 text-sm font-medium"
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