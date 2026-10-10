import Link from "next/link";
import type { SuggestedUser } from "@/lib/types";
import { compactNumber, displayName } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import FollowButton from "./FollowButton";

export default function UserRow({
  user,
  following,
  showBio = false,
  showFollow = true,
}: {
  user: SuggestedUser;
  following: boolean;
  showBio?: boolean;
  showFollow?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/40">
      <Link href={`/profile/${user.username}`} className="shrink-0">
        <UserAvatar user={user} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/profile/${user.username}`} className="block">
          <p className="truncate text-[15px] font-semibold hover:underline">{displayName(user)}</p>
          <p className="truncate text-sm text-muted-foreground">
            @{user.username} · {compactNumber(user.followerCount)} follower{user.followerCount === 1 ? "" : "s"}
          </p>
        </Link>
        {showBio && user.bio && <p className="mt-1 line-clamp-2 text-sm">{user.bio}</p>}
      </div>
      {showFollow && <FollowButton userId={user.id} initialFollowing={following} />}
    </div>
  );
}
