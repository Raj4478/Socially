import { getBookmarkedPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/users.action";
import PostCard from "@/components/PostCard";
import { BookmarkIcon } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function BookmarksPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const dbUserId = await getDbUserId().catch(() => null);
  const bookmarks = await getBookmarkedPosts();

  return (
    <div>
      <div className="sticky top-14 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <BookmarkIcon className="size-5" /> Bookmarks
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">@{user.username}</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BookmarkIcon className="size-8 text-primary" />
          </div>
          <h3 className="font-bold text-xl mb-2">Save posts for later</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Bookmark any post to easily find it again here.
          </p>
        </div>
      ) : (
        <div>
          {(bookmarks as any[]).map((post) => (
            <PostCard key={post.id} post={post} dbUserId={dbUserId} />
          ))}
        </div>
      )}
    </div>
  );
}
