import { getRandomUsers } from "@/actions/users.action";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import FollowButton from "./FollowButton";
import SearchBar from "./SearchBar";

async function RightPanel() {
  const authUser = await currentUser();
  const suggestions = authUser ? await getRandomUsers() : [];

  return (
    <div className="sticky top-16 pt-3 space-y-4">
      <SearchBar />

      {Array.isArray(suggestions) && suggestions.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <h3 className="font-bold text-base px-4 py-3 border-b border-border">Who to follow</h3>
          <div className="divide-y divide-border">
            {suggestions.map((user: any) => (
              <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                <Link href={`/profile/${user.username}`} className="shrink-0">
                  <Avatar className="size-10">
                    <AvatarImage src={user.image || "/avatar.png"} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${user.username}`}>
                    <p className="font-semibold text-sm truncate hover:underline">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </Link>
                  {user.bio && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user.bio}</p>
                  )}
                </div>
                {authUser && (
                  <FollowButton userId={user.id} />
                )}
              </div>
            ))}
          </div>
          <Link href="/explore" className="block text-primary text-sm px-4 py-3 hover:bg-muted/40 transition-colors">
            Show more →
          </Link>
        </div>
      )}

      <p className="text-xs text-muted-foreground px-1">
        © 2025 Socially · Built with Next.js & Prisma
      </p>
    </div>
  );
}

export default RightPanel;
