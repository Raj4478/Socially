export const dynamic = "force-dynamic";

import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/users.action";
import FeedHeader from "@/components/FeedHeader";
import PageTransition from "@/components/PageTransition";
import { syncUser } from "@/actions/users.action";

export default async function Home() {
  await syncUser().catch(() => null);

  const [posts, dbUserId] = await Promise.all([
    getPosts(),
    getDbUserId(),
  ]);

  return (
    <PageTransition>
    <div>
      <FeedHeader />
      <CreatePost />
      {posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post as any} dbUserId={dbUserId} />
        ))
      )}
    </div>
    </PageTransition>
  );
}

function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="relative mb-6">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-4xl">✨</span>
        </div>
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-30" />
      </div>
      <h3 className="font-bold text-xl mb-2">Your feed is empty</h3>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
        Be the first to share something! Or explore to find interesting people to follow.
      </p>
    </div>
  );
}
