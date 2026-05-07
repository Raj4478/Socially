"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function FeedHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-14 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ rotate: [0, 15, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
        >
          <Sparkles className="size-5 text-primary" />
        </motion.div>
        <h1 className="font-bold text-lg">Home</h1>
      </div>
    </motion.div>
  );
}
