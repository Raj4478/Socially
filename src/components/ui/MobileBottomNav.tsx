"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, BellIcon, BookmarkIcon, UserIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const NAV_PUBLIC = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/explore", icon: SearchIcon, label: "Explore" },
];

const NAV_PRIVATE = [
  { href: "/notifications", icon: BellIcon, label: "Alerts" },
  { href: "/bookmarks", icon: BookmarkIcon, label: "Saved" },
  { href: "/profile", icon: UserIcon, label: "Profile" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  const links = isSignedIn
    ? [...NAV_PUBLIC, ...NAV_PRIVATE]
    : NAV_PUBLIC;

  // Always show 5 slots, fill with empty divs if not signed in
  const slots = isSignedIn ? links : [
    ...NAV_PUBLIC,
    { href: null, icon: BellIcon, label: "Alerts" },
    { href: null, icon: BookmarkIcon, label: "Saved" },
    { href: null, icon: UserIcon, label: "Profile" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-background/95 backdrop-blur-xl border-t border-border/60">
      <div className="h-full grid grid-cols-5">
        {slots.map(({ href, icon: Icon, label }, i) => {
          if (!href) {
            return (
              <div key={i} className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground/30">
                <Icon className="size-5" />
                <span className="text-[10px]">{label}</span>
              </div>
            );
          }

          const active = pathname === href || (href === "/profile" && pathname.startsWith("/profile"));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors relative",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div whileTap={{ scale: 0.85 }} transition={{ type: "spring", stiffness: 400 }}>
                <Icon
                  className={cn(
                    "size-5",
                    active && "drop-shadow-[0_0_6px_oklch(0.67_0.22_264/0.8)]"
                  )}
                />
              </motion.div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
