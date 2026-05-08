export const dynamic = "force-dynamic";

import { getBookmarkedPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/users.action";
import PostCard from "@/components/PostCard";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BookmarksHeader from "@/components/BookmarksHeader";

export default async function BookmarksPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const [dbUserId, bookmarks] = await Promise.all([
    getDbUserId(),
    getBookmarkedPosts(),
  ]);

  return (
    <div>
      <BookmarksHeader username={user.username || ""} count={bookmarks.length} />
      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <div className="relative mb-6">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl">🔖</span>
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-20" />
          </div>
          <h3 className="font-bold text-xl mb-2">Nothing saved yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            Bookmark posts to easily find them again here.
          </p>
        </div>
      ) : (
        bookmarks.map((post) => (
          <PostCard key={post.id} post={post as any} dbUserId={dbUserId} />
        ))
      )}
    </div>
  );
}
