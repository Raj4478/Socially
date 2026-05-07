export const dynamic = "force-dynamic";

// @ts-nocheck
import { currentUser } from "@clerk/nextjs/server";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/users.action";
import FeedHeader from "@/components/FeedHeader";

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId().catch(() => null);

  return (
    <div>
      <FeedHeader />
      <CreatePost />
      {posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        posts.map((post: any) => (
          <PostCard key={post.id} post={post} dbUserId={dbUserId} />
        ))
      )}
    </div>
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
