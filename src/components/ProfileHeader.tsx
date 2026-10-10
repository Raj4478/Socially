"use client";

import { useState } from "react";
import { CalendarDaysIcon, LinkIcon, MapPinIcon } from "lucide-react";
import type { ProfileDTO } from "@/lib/types";
import { compactNumber, displayName } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import FollowButton from "./FollowButton";
import EditProfileDialog from "./EditProfileDialog";
import RichText from "./RichText";

export default function ProfileHeader({ profile }: { profile: ProfileDTO }) {
  const [followers, setFollowers] = useState(profile.followerCount);
  const joined = new Date(profile.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" });

  return (
    <section>
      <div className="aspect-[3/1] bg-gradient-to-br from-primary/25 via-primary/10 to-secondary">
        {profile.coverImage && <img src={profile.coverImage} alt="" className="size-full object-cover" />}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-start justify-between">
          <UserAvatar user={profile} size="xl" className="-mt-12 border-4 border-background sm:-mt-16" />
          <div className="pt-3">
            {profile.isMe ? (
              <EditProfileDialog profile={profile} />
            ) : (
              <FollowButton
                userId={profile.id}
                initialFollowing={profile.isFollowing}
                size="default"
                onChange={({ followerCount }) => setFollowers(followerCount)}
              />
            )}
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-xl font-bold leading-tight">{displayName(profile)}</h2>
          <p className="flex items-center gap-2 text-[15px] text-muted-foreground">
            @{profile.username}
            {profile.followsMe && <span className="rounded bg-secondary px-1.5 py-0.5 text-xs">Follows you</span>}
          </p>
        </div>

        {profile.bio && <RichText text={profile.bio} className="mt-3 whitespace-pre-wrap text-[15px]" />}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-muted-foreground">
          {profile.location && (
            <span className="flex items-center gap-1"><MapPinIcon className="size-4" />{profile.location}</span>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1 text-primary hover:underline">
              <LinkIcon className="size-4" />
              {profile.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
            </a>
          )}
          <span className="flex items-center gap-1"><CalendarDaysIcon className="size-4" />Joined {joined}</span>
        </div>

        <div className="mt-3 flex gap-5 text-[15px]">
          <span><b className="font-semibold">{compactNumber(profile.followingCount)}</b> <span className="text-muted-foreground">Following</span></span>
          <span><b className="font-semibold">{compactNumber(followers)}</b> <span className="text-muted-foreground">Follower{followers === 1 ? "" : "s"}</span></span>
        </div>
      </div>
    </section>
  );
}
