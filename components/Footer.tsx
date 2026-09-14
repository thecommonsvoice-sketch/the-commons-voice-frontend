"use client"
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { Facebook, Instagram, type LucideIcon } from "lucide-react";
// import { useCategoryStore } from '@/store/useCategoryStore'

const Footer = () => {

  // Static categories list
  const categories = [
    { name: "General", href: "/categories/general" },
    { name: "Politics", href: "/categories/politics" },
    { name: "Science and Technology", href: "/categories/science-and-technology" },
    { name: "Sports and Entertainment", href: "/categories/sports-and-entertainment" },
    { name: "Business", href: "/categories/business" },
    { name: "World", href: "/categories/world" },
    { name: "Defence", href: "/categories/defence" },
  ];

  type SocialLink =
    | {
        kind: "icon";
        icon: LucideIcon;
        href: string;
        label: string;
        color: string;
      }
    | {
        kind: "image";
        imageSrc: string;
        href: string;
        label: string;
        color: string;
      };

  const socialLinks: SocialLink[] = [
    {
      kind: "icon",
      icon: Instagram,
      href: "https://www.instagram.com/thecommons_voice/",
      label: "Instagram",
      color: "hover:text-pink-500",
    },
    {
      kind: "image",
      imageSrc: "https://cdn.simpleicons.org/threads/111111",
      href: "https://www.threads.com/@thecommons_voice",
      label: "Threads",
      color: "",
    },
    {
      kind: "icon",
      icon: Facebook,
      href: "https://www.facebook.com/profile.php?id=61578787756966",
      label: "Facebook",
      color: "hover:text-blue-600",
    },
    {
      kind: "image",
      imageSrc: "https://cdn.simpleicons.org/x/111111",
      href: "https://x.com/commonsvoice1",
      label: "X",
      color: "",
    },
  ];

  // Use all 5 categories (or slice if you strictly want max 5, but static list is already 5)
  const newCat = categories;
  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-200 dark:bg-slate-950">
      {/* Top Footer Banner / Newsletter Callout */}
      <div className="border-b border-slate-800/80 bg-slate-950/50 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white font-serif">Subscribe to The Commons Voice</h3>
            <p className="text-sm text-slate-400">Get independent daily reporting and investigative stories delivered straight to your inbox.</p>
          </div>
          <div className="flex w-full md:w-auto items-center gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-slate-800 border border-slate-700 text-white placeholder-slate-400 text-sm rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full md:w-72"
            />
            <button className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white font-serif font-bold text-base">
                C
              </div>
              <h3 className="notranslate font-serif font-bold text-lg text-white" translate="no">The Commons Voice</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Independent journalism committed to truth, depth, and community voice.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 transition-all duration-300 hover:scale-110 hover:bg-slate-700 ${social.color}`}
                  title={social.label}
                >
                  {social.kind === "icon" && social.icon ? (
                    <social.icon className="w-4 h-4" />
                  ) : social.kind === "image" ? (
                    <Image
                      src={social.imageSrc}
                      alt={social.label}
                      width={16}
                      height={16}
                      className="w-4 h-4 invert transition-all"
                      unoptimized
                    />
                  ) : null}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {newCat && newCat.map((cat) => (
                <li key={cat.name}>
                  <Link href={cat.href} className="hover:text-white transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">About</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; 2026 <span className="notranslate" translate="no">The Commons Voice</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer