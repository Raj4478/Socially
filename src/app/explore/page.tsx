export const dynamic = "force-dynamic";

// @ts-nocheck
import { searchUsers } from "@/actions/users.action";
import { searchPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/users.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import FollowButton from "@/components/FollowButton";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import ExploreClient from "@/components/ExploreClient";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";
  const authUser = await currentUser();
  const dbUserId = await getDbUserId().catch(() => null);

  const [users, posts] = await Promise.all([
    query ? searchUsers(query) : [],
    query ? searchPosts(query) : [],
  ]);

  return (
    <ExploreClient
      query={query}
      users={users}
      posts={posts as any[]}
      dbUserId={dbUserId}
      isSignedIn={!!authUser}
    />
  );
}
