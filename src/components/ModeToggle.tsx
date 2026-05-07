"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="size-9" />;

  const isDark = resolvedTheme === "dark";

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.88 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative size-9 flex items-center justify-center rounded-full border border-border/60 bg-muted/40 hover:bg-muted hover:border-primary/30 transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatedIcon isDark={isDark} />
    </motion.button>
  );
}

function AnimatedIcon({ isDark }: { isDark: boolean }) {
  return (
    <motion.div
      key={isDark ? "moon" : "sun"}
      initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
      exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {isDark
        ? <MoonIcon className="size-4 text-primary" />
        : <SunIcon className="size-4 text-amber-500" />
      }
    </motion.div>
  );
}
