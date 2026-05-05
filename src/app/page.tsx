import { currentUser } from "@clerk/nextjs/server";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/users.action";
import { Sparkles } from "lucide-react";

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId().catch(() => null);

  return (
    <div>
      {/* Feed header */}
      <div className="sticky top-14 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          Home
        </h1>
      </div>

      <CreatePost />

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="size-8 text-primary" />
          </div>
          <h3 className="font-bold text-xl mb-2">Nothing here yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Be the first to post something! Your feed will fill up as you follow people.
          </p>
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} dbUserId={dbUserId} />
          ))}
        </div>
      )}
    </div>
  );
}
