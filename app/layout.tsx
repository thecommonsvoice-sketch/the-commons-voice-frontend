import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "The Commons Voice", template: "%s | The Commons Voice" },
  description: "Independent news, analysis, and reporting from around the world.",
  keywords: ["news", "journalism", "politics", "world", "analysis", "reporting"],
  authors: [{ name: "The Commons Voice Team" }],
  creator: "The Commons Voice",
  publisher: "The Commons Voice",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    title: "The Commons Voice",
    description: "Independent news, analysis, and reporting from around the world.",
    siteName: "The Commons Voice",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Commons Voice",
    description: "Independent news, analysis, and reporting from around the world.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <body className={`${inter.className} h-screen bg-background text-foreground antialiased overflow-x-hidden`}>
        <Script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}`}
     crossOrigin="anonymous"></Script>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="w-full h-full overflow-y-auto flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}