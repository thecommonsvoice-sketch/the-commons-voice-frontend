import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "The Common Voice", template: "%s | The Common Voice" },
  description: "Independent news, analysis, and reporting from around the world.",
  keywords: ["news", "journalism", "politics", "world", "analysis", "reporting"],
  authors: [{ name: "The Common Voice Team" }],
  creator: "The Common Voice",
  publisher: "The Common Voice",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    title: "The Common Voice",
    description: "Independent news, analysis, and reporting from around the world.",
    siteName: "The Common Voice",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Common Voice",
    description: "Independent news, analysis, and reporting from around the world.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="w-[100vw] h-[100vh] overflow-y-auto overflow-x-hidden flex-1">
                {children}
              </main>
              <footer className="border-t bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <h3 className="font-semibold mb-3">The Common Voice</h3>
                      <p className="text-sm text-muted-foreground">
                        Independent journalism for the modern world.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Categories</h4>
                      <ul className="space-y-1 text-sm">
                        <li><Link href="/categories/world" className="hover:underline">World</Link></li>
                        <li><Link href="/categories/politics" className="hover:underline">Politics</Link></li>
                        <li><Link href="/categories/business" className="hover:underline">Business</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">About</h4>
                      <ul className="space-y-1 text-sm">
                        <li><Link href="/about" className="hover:underline">About Us</Link></li>
                        <li><Link href="/contact" className="hover:underline">Contact</Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Legal</h4>
                      <ul className="space-y-1 text-sm">
                        <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; 2025 The Common Voice. All rights reserved.</p>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}