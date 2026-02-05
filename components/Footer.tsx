"use client"
import Link from 'next/link'
import React from 'react'
// import { useCategoryStore } from '@/store/useCategoryStore'

const Footer = () => {

  // Static categories list
  const categories = [
    { name: "General", href: "/categories/general" },
    { name: "Politics", href: "/categories/politics" },
    { name: "Science and Technology", href: "/categories/science-and-technology" },
    { name: "Page 4", href: "/categories/page-4" },
    { name: "Business", href: "/categories/business" },
  ];

  // Use all 5 categories (or slice if you strictly want max 5, but static list is already 5)
  const newCat = categories;
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">The Commons Voice</h3>
            <p className="text-sm text-muted-foreground">
              Independent journalism for the modern world.
            </p>
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
          <p>&copy; 2025 The Commons Voice. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer