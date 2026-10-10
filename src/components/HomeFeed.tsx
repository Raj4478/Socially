"use client";

import { useState } from "react";
import Link from "next/link";
import { CompassIcon, UsersIcon } from "lucide-react";
import type { Page, PostDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Composer from "./Composer";
import Feed from "./Feed";
import EmptyState from "./EmptyState";

/** Composer + feed: new posts appear at the top without a reload. */
export default function HomeFeed({
  tab,
  initial,
  loadMore,
  viewerId,
}: {
  tab: "for-you" | "following";
  initial: Page<PostDTO>;
  loadMore: (cursor: string) => Promise<Page<PostDTO>>;
  viewerId: string | null;
}) {
  const [mine, setMine] = useState<PostDTO[]>([]);

  return (
    <>
      <Composer onPosted={(post) => setMine((m) => [post, ...m])} />
      <Feed
        key={tab}
        initial={initial}
        loadMore={loadMore}
        viewerId={viewerId}
        prepend={mine}
        empty={
          tab === "following" ? (
            <EmptyState
              icon={UsersIcon}
              title={viewerId ? "Nothing here yet" : "Sign in to see who you follow"}
              description="Posts from people you follow will show up here. Find people to follow on Explore."
              action={<Button asChild className="rounded-full"><Link href="/explore">Explore people</Link></Button>}
            />
          ) : (
            <EmptyState
              icon={CompassIcon}
              title="No posts yet"
              description="Be the first to share something with the community."
            />
          )
        }
      />
    </>
  );
}
