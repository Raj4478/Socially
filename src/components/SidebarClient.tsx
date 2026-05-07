"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import {
  HomeIcon, SearchIcon, BellIcon, BookmarkIcon,
  UserIcon, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",              icon: HomeIcon,     label: "Home" },
  { href: "/explore",       icon: SearchIcon,   label: "Explore" },
  { href: "/notifications", icon: BellIcon,     label: "Notifications" },
  { href: "/bookmarks",     icon: BookmarkIcon, label: "Bookmarks" },
];

interface Props {
  username: string;
  name: string;
  image: string;
  following: number;
  followers: number;
}

export default function SidebarClient({ username, name, image, following, followers }: Props) {
  const pathname = usePathname();

  return (
    <div className="sticky top-14 pt-3 flex flex-col gap-1 pr-2">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 px-3 py-3 mb-1 group">
        <motion.div whileHover={{ rotate: 20, scale: 1.15 }} transition={{ type: "spring", stiffness: 400 }}>
          <Zap className="size-8 fill-primary text-primary drop-shadow-[0_0_10px_oklch(0.67_0.22_264/0.7)]" />
        </motion.div>
        <span className="font-black text-xl gradient-text text-glow">Socially</span>
      </Link>

      {/* Nav links */}
      {NAV.map(({ href, icon: Icon, label }, i) => {
        const active = pathname === href;
        return (
          <motion.div
            key={href}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 30 }}
          >
            <Link href={href}
              className={cn(
                "nav-item flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-[15px] group relative",
                active
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
              )}>
              {active && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative z-10"
              >
                <Icon className={cn(
                  "size-5 transition-all",
                  active && "drop-shadow-[0_0_8px_oklch(0.67_0.22_264/0.7)]"
                )} />
              </motion.div>
              <span className="relative z-10">{label}</span>
              {active && (
                <motion.div
                  layoutId="sidebar-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}

      {/* Profile nav */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: NAV.length * 0.06, type: "spring", stiffness: 400, damping: 30 }}
      >
        <Link href={`/profile/${username}`}
          className={cn(
            "nav-item flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium text-[15px] group relative",
            pathname.startsWith("/profile")
              ? "text-primary font-bold"
              : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
          )}>
          {pathname.startsWith("/profile") && (
            <motion.div
              layoutId="sidebar-active-bg"
              className="absolute inset-0 bg-primary/10 rounded-xl"
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="relative z-10">
            <UserIcon className={cn("size-5", pathname.startsWith("/profile") && "drop-shadow-[0_0_8px_oklch(0.67_0.22_264/0.7)]")} />
          </motion.div>
          <span className="relative z-10">Profile</span>
          {pathname.startsWith("/profile") && (
            <motion.div layoutId="sidebar-dot" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 500, damping: 35 }} />
          )}
        </Link>
      </motion.div>

      {/* User card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 25 }}
        className="mt-3 pt-3 border-t border-border/60"
      >
        <Link href={`/profile/${username}`}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-primary/5 transition-all group">
          <div className="avatar-ring shrink-0">
            <Avatar className="size-9">
              <AvatarImage src={image || "/avatar.png"} />
              <AvatarFallback className="text-sm font-bold">{name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{name}</p>
            <p className="text-xs text-muted-foreground truncate">@{username}</p>
          </div>
        </Link>
        <div className="flex gap-4 px-2.5 mt-1 text-xs text-muted-foreground">
          <span><b className="text-foreground font-semibold">{following}</b> Following</span>
          <span><b className="text-foreground font-semibold">{followers}</b> Followers</span>
        </div>
      </motion.div>
    </div>
  );
}
