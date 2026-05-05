"use client";

import { toggleFollow } from "@/actions/users.action";
import { Button } from "./ui/button";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";

export default function FollowButton({ userId, initialFollowing = false }: {
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
      toast.error("Failed to update follow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className="rounded-full px-4 font-bold shrink-0"
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
