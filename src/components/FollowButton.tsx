"use client";

import { toggleFollow } from "@/actions/users.action";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function FollowButton({
  userId,
  initialFollowing = false,
}: {
  userId: string;
  initialFollowing?: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const { isSignedIn } = useAuth();

  const handleFollow = async () => {
    if (!isSignedIn) { toast.error("Sign in to follow"); return; }
    try {
      setLoading(true);
      await toggleFollow(userId);
      setIsFollowing((p) => !p);
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      onClick={handleFollow}
      disabled={loading}
      className={cn(
        "px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border",
        isFollowing
          ? "border-border text-muted-foreground hover:border-red-500/60 hover:text-red-500 hover:bg-red-500/5"
          : "bg-foreground text-background border-foreground hover:bg-foreground/90 glow-sm"
      )}
    >
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </motion.button>
  );
}
