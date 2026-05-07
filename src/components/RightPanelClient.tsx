"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import FollowButton from "./FollowButton";
import SearchBar from "./SearchBar";
import { motion } from "framer-motion";
import { TrendingUpIcon, SparklesIcon } from "lucide-react";

interface Props {
  suggestions: any[];
  isSignedIn: boolean;
}

export default function RightPanelClient({ suggestions, isSignedIn }: Props) {
  return (
    <div className="sticky top-16 pt-4 space-y-4">
      {/* Search */}
      <SearchBar />

      {/* Who to follow */}
      {isSignedIn && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 28 }}
          className="glass rounded-2xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
            <SparklesIcon className="size-4 text-primary" />
            <h3 className="font-bold text-sm">Who to follow</h3>
          </div>

          <div className="divide-y divide-border/40">
            {suggestions.map((user: any, i: number) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07, type: "spring", stiffness: 350, damping: 30 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors"
              >
                <Link href={`/profile/${user.username}`} className="shrink-0">
                  <div className="avatar-ring">
                    <Avatar className="size-9">
                      <AvatarImage src={user.image || "/avatar.png"} />
                      <AvatarFallback className="text-xs font-bold">{user.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${user.username}`}>
                    <p className="font-semibold text-sm truncate hover:text-primary transition-colors">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user._count.followers.toLocaleString()} followers
                  </p>
                </div>
                <FollowButton userId={user.id} />
              </motion.div>
            ))}
          </div>

          <Link href="/explore"
            className="flex items-center gap-1.5 text-primary text-sm px-4 py-3 hover:bg-primary/5 transition-colors border-t border-border/60 font-medium">
            <TrendingUpIcon className="size-3.5" />
            Show more
          </Link>
        </motion.div>
      )}

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-muted-foreground/60 px-1 leading-relaxed"
      >
        © 2025 Socially · Built with Next.js 15, Prisma & ❤️
      </motion.p>
    </div>
  );
}
