"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, BellIcon, BookmarkIcon, UserIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/explore", icon: SearchIcon, label: "Explore" },
  { href: "/notifications", icon: BellIcon, label: "Alerts" },
  { href: "/bookmarks", icon: BookmarkIcon, label: "Saved" },
  { href: "/profile", icon: UserIcon, label: "Profile" },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-background/95 backdrop-blur border-t border-border">
      <div className="h-full grid grid-cols-5">
        {LINKS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          if (!isSignedIn && (href === "/notifications" || href === "/bookmarks" || href === "/profile")) {
            return <div key={href} />;
          }
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-primary transition-colors",
                active && "text-primary"
              )}
            >
              <Icon className={cn("size-5", active && "fill-primary/20")} />
              <span className="text-[10px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
