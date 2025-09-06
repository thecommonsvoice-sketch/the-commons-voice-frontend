"use client"
import Link from 'next/link'
import React, { useEffect } from 'react'
import { useCategoryStore } from '@/store/useCategoryStore'

const Footer = () => {
    const { categories } = useCategoryStore();
    const [newCat,setNewCat] = React.useState(categories);
    useEffect(()=>{
        let max=5;
        if(categories.length<5) max=categories.length;
        setNewCat(categories.slice(0,max));
    },[categories])
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