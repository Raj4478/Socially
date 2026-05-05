import { searchUsers } from "@/actions/users.action";
import { searchPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/users.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import FollowButton from "@/components/FollowButton";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { currentUser } from "@clerk/nextjs/server";

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
    <div>
      <div className="sticky top-14 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3">
        <h1 className="font-bold text-lg mb-3">Explore</h1>
        <SearchBar />
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <SearchIcon className="size-12 text-muted-foreground mb-4" />
          <h3 className="font-bold text-xl mb-2">Search Socially</h3>
          <p className="text-muted-foreground text-sm">Find people, posts, and topics.</p>
        </div>
      ) : (
        <div>
          {users.length > 0 && (
            <div>
              <h2 className="font-bold px-4 py-3 border-b border-border">People</h2>
              {users.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border">
                  <Link href={`/profile/${u.username}`} className="shrink-0">
                    <Avatar className="size-12">
                      <AvatarImage src={u.image || "/avatar.png"} />
                      <AvatarFallback>{u.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${u.username}`}>
                      <p className="font-bold hover:underline">{u.name}</p>
                      <p className="text-sm text-muted-foreground">@{u.username}</p>
                    </Link>
                    {u.bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{u.bio}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{u._count.followers} followers</p>
                  </div>
                  {authUser && <FollowButton userId={u.id} />}
                </div>
              ))}
            </div>
          )}

          {posts.length > 0 && (
            <div>
              <h2 className="font-bold px-4 py-3 border-b border-border">Posts</h2>
              {(posts as any[]).map((post) => (
                <PostCard key={post.id} post={post} dbUserId={dbUserId} />
              ))}
            </div>
          )}

          {users.length === 0 && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <SearchIcon className="size-12 text-muted-foreground mb-4" />
              <h3 className="font-bold text-xl mb-2">No results for "{query}"</h3>
              <p className="text-muted-foreground text-sm">Try different keywords or check spelling.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
