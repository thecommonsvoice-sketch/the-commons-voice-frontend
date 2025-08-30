"use client";
import Link from "next/link";
import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, User, Settings, LogOut, ChevronDown } from "lucide-react";
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

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      clearUser();
      router.replace("/");
    }
  };

  const categories = [
    { name: "World", href: "/categories/world" },
    { name: "Politics", href: "/categories/politics" },
    { name: "Business", href: "/categories/business" },
    { name: "Technology", href: "/categories/tech" },
    { name: "Sports", href: "/categories/sports" },
    { name: "Entertainment", href: "/categories/entertainment" },
  ];

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
              <span className="font-bold text-xl">The Common Voice</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {category.name}
                </Link>
              ))}
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
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
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