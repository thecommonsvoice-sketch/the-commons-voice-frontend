"use client";

import Link from "next/link";

export default function Footer() {
  const editorialSections = [
    { name: "General News & Wire", href: "/categories/general" },
    { name: "Politics & Statecraft", href: "/categories/politics" },
    { name: "Science & Technology", href: "/categories/science-and-technology" },
    { name: "Sports & Entertainment", href: "/categories/sports-and-entertainment" },
    { name: "Business & Commerce", href: "/categories/business" },
    { name: "World & Regional Wire", href: "/categories/world" },
    { name: "Defence & Strategic Affairs", href: "/categories/defence" },
  ];

  const investigativeUnits = [
    { name: "Climate Observatory", href: "/categories/science-and-technology" },
    { name: "Financial Forensic Desk", href: "/categories/business" },
    { name: "Elections & Polling Tracker", href: "/categories/politics" },
    { name: "Commons Podcast Network", href: "/articles" },
    { name: "Special Documentary Archive", href: "/articles" },
  ];

  const commonsTrust = [
    { name: "Contact Us & Desk", href: "/contact" },
    { name: "Editorial Code of Ethics", href: "/about" },
    { name: "Corrections & Clarifications", href: "/about" },
    { name: "Press Freedom Charter", href: "/about" },
    { name: "Subscriber Help Desk", href: "/contact" },
  ];

  return (
    <footer className="w-full bg-[#1A1715] text-[#FAF7F2] pt-12 pb-8 border-t-4 border-[#C2410C]">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Top Footer: Brand Statement & Foreign Bureaus Telegram */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-[#3C3835]">
          <div className="lg:col-span-6 space-y-3">
            <h4 className="font-masthead text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF7F2]">
              The Commons Voice
            </h4>
            <span className="font-sans text-[10px] tracking-[0.25em] uppercase text-stone-400 font-bold block">
              Independent International Broadsheet of Record
            </span>
            <p className="font-serif text-sm text-stone-300 max-w-lg leading-relaxed pt-1">
              Dedicated to verified reporting, geopolitical perspective, and rigorous editorial analysis across continents and cultures. Published without corporate or partisan bias.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between bg-[#23201E] p-6 border border-[#3C3835]">
            <div>
              <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-[#C2410C] block mb-1">
                Newsroom &amp; Editorial Desk
              </span>
              <p className="font-serif text-xs text-stone-300">
                For news tips, corrections, press releases, and editorial submissions:
              </p>
              <div className="font-mono text-xs text-amber-200 mt-2 bg-[#1A1715] p-2.5 border border-[#3C3835] flex items-center justify-between flex-wrap gap-2">
                <a href="mailto:contact@thecommonsvoice.com" className="hover:underline">
                  contact@thecommonsvoice.com
                </a>
                <Link
                  href="/contact"
                  className="text-[10px] font-sans font-bold bg-[#C2410C] hover:bg-[#9A3412] text-white px-2.5 py-1 uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                >
                  <span>Contact Page</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Editorial Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-b border-[#3C3835] font-sans text-xs">
          <div>
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-stone-300 mb-3">
              Editorial Sections
            </h5>
            <ul className="space-y-2 text-stone-400">
              {editorialSections.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-stone-200 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-stone-300 mb-3">
              Investigative Units
            </h5>
            <ul className="space-y-2 text-stone-400">
              {investigativeUnits.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-stone-200 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-stone-300 mb-3">
              Commons Trust
            </h5>
            <ul className="space-y-2 text-stone-400">
              {commonsTrust.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-stone-200 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold uppercase tracking-wider text-[11px] text-stone-300 mb-3">
              Newsroom Desk
            </h5>
            <ul className="space-y-2.5 text-stone-400 text-xs">
              <li>
                <strong className="text-stone-300">Official Email:</strong>{" "}
                <a
                  href="mailto:contact@thecommonsvoice.com"
                  className="hover:underline text-amber-200"
                >
                  contact@thecommonsvoice.com
                </a>
              </li>
              <li>
                <strong className="text-stone-300">Office:</strong> Dehradun, Uttarakhand, India
              </li>
              <li>
                <strong className="text-stone-300">Response:</strong> Within 24–48 Hours
              </li>
              <li className="pt-2 border-t border-[#3C3835]">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C2410C] hover:text-amber-300 transition-colors uppercase tracking-wider"
                >
                  <span>Open Contact Us Form</span>
                  <span>→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} The Commons Voice. Independent journalism for the global public interest.</p>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-[#C2410C] font-semibold text-stone-300 transition-colors">
              Contact Us
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-stone-300 transition-colors">
              About Us
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}