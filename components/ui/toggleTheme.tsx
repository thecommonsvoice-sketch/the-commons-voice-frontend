"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Toggle } from "./toggle";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Wait until after mount to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  if (!mounted) return null; // Prevent rendering on server

  return (
    <Toggle
      className="hover:cursor-pointer hover:scale-[1.1] z-100 bg-transparent hover:bg-transparent dark:hover:bg-transparent"
      onClick={toggleTheme}
    >
      {theme === "light" ? <Sun /> : <Moon />}
    </Toggle>
  );
}
