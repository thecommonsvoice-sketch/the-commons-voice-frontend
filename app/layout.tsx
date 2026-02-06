// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google"; // Import Merriweather
import "./globals.css";
import AuthProvider from "@/providers/AuthProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { AdSlot } from "@/components/AdSlot";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "The Commons Voice - Independent News & Analysis",
    template: "%s | The Commons Voice",
  },
  description:
    "Independent news, analysis, and reporting from around the world. Stay informed with breaking news, in-depth analysis, and expert coverage on politics, business, health, lifestyle, and more.",
  keywords: [
    "news", "journalism", "politics", "world news", "analysis", "reporting",
    "breaking news", "current events", "business news", "health news",
    "lifestyle", "sports coverage", "television", "media", "investigative journalism"
  ],
  authors: [{ name: "The Commons Voice Team" }],
  creator: "The Commons Voice",
  publisher: "The Commons Voice",
  applicationName: "The Commons Voice",
  referrer: "origin-when-cross-origin",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", sizes: "180x180", url: "/apple-touch-icon.png" },
    { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
    { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
  ],
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    title: "The Commons Voice - Independent News & Analysis",
    description:
      "Independent news, analysis, and reporting from around the world. Stay informed with breaking news, in-depth analysis, and expert coverage.",
    siteName: "The Commons Voice",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Commons Voice",
    description: "Independent news, analysis, and reporting from around the world.",
    site: "@TheCommonsVoice",
    creator: "@TheCommonsVoice",
    images: ["/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: process.env.NEXT_PUBLIC_SITE_URL },
  // verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="_nmZiV9WeB08rFkX15T_x_LEYcbinV484NCAcCg0rsY" />
      </head>
      <body
        className={`${inter.variable} ${merriweather.variable} font-sans h-screen bg-background text-foreground antialiased overflow-x-hidden`}
      >
        {/* Load AdSense script once, correctly */}
        {adsenseClient && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        )}

        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />

              <main className="w-full h-full overflow-y-auto flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}   