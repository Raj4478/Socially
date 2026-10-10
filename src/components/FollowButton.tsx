"use client";

import { useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/users.action";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FollowButton({
  userId,
  initialFollowing = false,
  size = "sm",
  onChange,
}: {
  userId: string;
  initialFollowing?: boolean;
  size?: "sm" | "default";
  onChange?: (state: { following: boolean; followerCount: number }) => void;
}) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);

  const click = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) return openSignIn();
    setBusy(true);
    setFollowing((f) => !f);
    const res = await toggleFollow(userId);
    setBusy(false);
    if (!res.success) {
      setFollowing((f) => !f);
      toast.error(res.error);
      return;
    }
    setFollowing(res.data.following);
    onChange?.(res.data);
  };

  return (
    <Button
      size={size}
      variant={following ? "outline" : "default"}
      disabled={busy}
      onClick={click}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-pressed={following}
      className={cn(
        "min-w-24 rounded-full font-semibold",
        !following && "bg-foreground text-background hover:bg-foreground/85",
        following && hover && "border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
      )}
    >
      {following ? (hover ? "Unfollow" : "Following") : "Follow"}
    </Button>
  );
}
