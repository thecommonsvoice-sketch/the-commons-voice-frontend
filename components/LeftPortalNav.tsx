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
                <button onClick={() => setMobileOpen(false)}>
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
      <aside className="hidden md:flex flex-col w-full border-r bg-background p-3 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
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
    <div className="mb-2">
      {hasChildren ? (
        <div>
          <button
            className={`flex justify-between items-center w-full px-3 py-2 rounded transition-colors
              ${isActive ? "bg-primary/10 text-primary" : "hover:bg-accent"}`}
            onClick={() => setOpen(open === item.label ? null : item.label)}
          >
            <div className="flex items-center gap-2">
              {item.icon && <item.icon size={18} />}
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
                className="pl-4 mt-1 space-y-1"
              >
                {item.children?.map((sub) => (
                  <Link
                    key={sub.label}
                    href={sub.href}
                    className={`block text-sm px-2 py-1 rounded hover:bg-accent ${pathname.startsWith(sub.href)
                        ? "text-primary font-medium"
                        : ""
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
          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors
            ${isActive
              ? "bg-primary/10 text-primary font-medium"
              : "hover:bg-accent"
            }`}
          onClick={onClose}
        >
          {item.icon && <item.icon size={18} />}
          {item.label}
        </Link>
      )}
    </div>
  );
}
