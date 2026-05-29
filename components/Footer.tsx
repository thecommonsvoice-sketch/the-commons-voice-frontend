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
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="notranslate font-semibold mb-3" translate="no">The Commons Voice</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We love to tell grounded stories and explore life.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center w-5 h-5 transition-all duration-300 hover:scale-110 text-muted-foreground ${social.color}`}
                  title={social.label}
                >
                  {social.kind === "icon" && social.icon ? (
                    <social.icon className="w-full h-full" />
                  ) : social.kind === "image" ? (
                    <Image
                      src={social.imageSrc}
                      alt={social.label}
                      width={20}
                      height={20}
                      className="w-full h-full brightness-0 dark:invert transition-all"
                      unoptimized
                    />
                  ) : null}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Categories</h4>
            <ul className="space-y-1 text-sm">

              {
                newCat && newCat.map((cat) => (
                  <li key={cat.name}>
                    <Link href={cat.href} className="hover:underline">{cat.name}</Link>
                  </li>
                ))
              }
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
          <p>&copy; 2026 <span className="notranslate" translate="no">The Commons Voice</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer