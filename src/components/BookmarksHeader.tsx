"use client";

import { motion } from "framer-motion";
import { BookmarkIcon } from "lucide-react";

export default function BookmarksHeader({ username, count }: { username: string; count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-14 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <BookmarkIcon className="size-5 text-primary" />
        <div>
          <h1 className="font-bold text-lg">Bookmarks</h1>
          <p className="text-xs text-muted-foreground">
            @{username} · {count} saved
          </p>
        </div>
      </div>
    </motion.div>
  );
}
