"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { portalNav } from "@/lib/portalNav";
import {
  ChevronDown,
  ChevronUp,
  SquareChevronLeft,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  children?: Array<{ label: string; href: string }>;
}

export function LeftPortalNav() {
  const pathname = usePathname() ?? ""; // ✅ Always a string
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden flex justify-between items-center p-2 border-b bg-background">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <SquareChevronLeft size={20} /> Sidebar
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="bg-background w-64 h-full p-4 overflow-y-auto shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Sidebar</h2>
                <button onClick={() => setMobileOpen(false)} aria-label="Close sidebar">
                  <X size={20} />
                </button>
              </div>

              {portalNav.map((item) => (
                <NavItem
                  key={item.label}
                  item={item}
                  pathname={pathname} // ✅ Safe
                  open={open}
                  setOpen={setOpen}
                  onClose={() => setMobileOpen(false)} // Close the Sidebar when a link is clicked
                />
              ))}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-full border border-slate-200 bg-card rounded-2xl p-3 shadow-xs sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-1">
        <div className="px-3 py-2 mb-1 border-b border-border/70 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-primary rounded-full" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Portal Hub</h2>
        </div>
        {portalNav.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            pathname={pathname} // ✅ Safe
            open={open}
            setOpen={setOpen}
          />
        ))}
      </aside>
    </>
  );
}

function NavItem({
  item,
  pathname,
  open,
  setOpen,
  onClose,
}: {
  item: NavItem;
  pathname: string;
  open: string | null;
  setOpen: (v: string | null) => void;
  onClose?: () => void;
}) {
  const isActive = pathname.startsWith(item.href);
  const hasChildren = !!item.children;

  return (
    <div className="mb-1">
      {hasChildren ? (
        <div>
          <button
            className={`flex justify-between items-center w-full px-3 py-2 rounded-lg text-sm font-semibold transition-all
              ${isActive ? "bg-primary/10 text-primary border-l-3 border-primary" : "text-slate-800 hover:bg-primary/10 hover:text-primary"}`}
            onClick={() => setOpen(open === item.label ? null : item.label)}
          >
            <div className="flex items-center gap-2.5">
              {item.icon && <item.icon size={18} className={isActive ? "text-primary" : "text-slate-500"} />}
              <span>{item.label}</span>
            </div>
            {open === item.label ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>
          <AnimatePresence>
            {open === item.label && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pl-4 mt-1 space-y-1 border-l-2 border-slate-200 ml-3"
              >
                {item.children?.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    className={`block text-xs font-medium px-2 py-1.5 rounded-md transition-colors ${pathname.startsWith(sub.href)
                        ? "text-primary font-bold bg-primary/10"
                        : "text-slate-700 hover:text-primary hover:bg-primary/5"
                      }`}
                    onClick={onClose}
                  >
                    {sub.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Link
          href={item.href}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all
            ${isActive
              ? "bg-primary/10 text-primary border-l-3 border-primary font-bold"
              : "text-slate-800 hover:bg-primary/10 hover:text-primary"
            }`}
          onClick={onClose}
        >
          {item.icon && <item.icon size={18} className={isActive ? "text-primary" : "text-slate-500"} />}
          {item.label}
        </Link>
      )}
    </div>
  );
}
