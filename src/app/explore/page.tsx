export const dynamic = "force-dynamic";

import { searchUsers } from "@/actions/users.action";
import { searchPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/users.action";
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

  const [dbUserId, users, posts] = await Promise.all([
    getDbUserId(),
    query ? searchUsers(query) : Promise.resolve([]),
    query ? searchPosts(query) : Promise.resolve([]),
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
