"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, BookmarkIcon, CompassIcon, HomeIcon, UserIcon, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; badge?: number; match?: (path: string) => boolean };

function navItems(username: string | null, unread: number): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "Home", icon: HomeIcon, match: (p) => p === "/" },
    { href: "/explore", label: "Explore", icon: CompassIcon, match: (p) => p.startsWith("/explore") || p.startsWith("/tags") },
  ];
  if (username) {
    items.push(
      { href: "/notifications", label: "Notifications", icon: BellIcon, badge: unread },
      { href: "/bookmarks", label: "Bookmarks", icon: BookmarkIcon },
      { href: `/profile/${username}`, label: "Profile", icon: UserIcon, match: (p) => p === `/profile/${username}` }
    );
  }
  return items;
}

function isActive(item: NavItem, path: string) {
  return item.match ? item.match(path) : path.startsWith(item.href);
}

function Badge({ count, className }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span className={cn("flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground", className)}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

type NavProps = { username: string | null; unread: number };

export function SideNavLinks({ username, unread }: NavProps) {
  const path = usePathname();
  const items = navItems(username, unread);
  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = isActive(item, path);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-4 rounded-full px-4 py-2.5 text-[17px] transition-colors hover:bg-accent",
              active ? "font-semibold" : "text-foreground/80"
            )}
          >
            <span className="relative">
              <Icon className="size-6" strokeWidth={active ? 2.4 : 1.8} />
              <Badge count={item.badge ?? 0} className="absolute -right-2.5 -top-2" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNavLinks({ username, unread }: NavProps) {
  const path = usePathname();
  const items = navItems(username, unread);
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-around">
        {items.map((item) => {
          const active = isActive(item, path);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn("relative flex size-12 items-center justify-center rounded-full", active ? "text-foreground" : "text-muted-foreground")}
            >
              <Icon className="size-6" strokeWidth={active ? 2.4 : 1.8} />
              <Badge count={item.badge ?? 0} className="absolute right-1.5 top-1.5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
