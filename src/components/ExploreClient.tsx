"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon, UsersIcon, FileTextIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import FollowButton from "./FollowButton";
import PostCard from "./PostCard";
import SearchBar from "./SearchBar";

interface Props {
  query: string;
  users: any[];
  posts: any[];
  dbUserId: string | null;
  isSignedIn: boolean;
}

export default function ExploreClient({ query, users, posts, dbUserId, isSignedIn }: Props) {
  const hasResults = users.length > 0 || posts.length > 0;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-14 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3 space-y-3"
      >
        <h1 className="font-bold text-lg flex items-center gap-2">
          <SearchIcon className="size-5 text-primary" />
          Explore
        </h1>
        <SearchBar />
      </motion.div>

      {/* Empty state */}
      {!query && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24 text-center px-6"
        >
          <div className="relative mb-6">
            <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center">
              <SearchIcon className="size-9 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping opacity-40" />
          </div>
          <h3 className="font-bold text-xl mb-2">Discover something new</h3>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            Search for people, topics, or keywords to find what's happening on Socially.
          </p>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {query && (
          <motion.div
            key={query}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* People */}
            {users.length > 0 && (
              <div>
                <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
                  <UsersIcon className="size-4 text-primary" />
                  <h2 className="font-bold text-sm">People</h2>
                  <span className="text-xs text-muted-foreground ml-auto">{users.length} results</span>
                </div>
                {users.map((u: any, i: number) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
                    className="flex items-center gap-3 px-4 py-3.5 border-b border-border/40 hover:bg-primary/5 transition-colors"
                  >
                    <Link href={`/profile/${u.username}`} className="shrink-0">
                      <div className="avatar-ring">
                        <Avatar className="size-12">
                          <AvatarImage src={u.image || "/avatar.png"} />
                          <AvatarFallback className="font-bold">{u.name?.[0]}</AvatarFallback>
                        </Avatar>
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${u.username}`}>
                        <p className="font-bold hover:text-primary transition-colors">{u.name}</p>
                        <p className="text-sm text-muted-foreground">@{u.username}</p>
                      </Link>
                      {u.bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{u.bio}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {u._count.followers.toLocaleString()} followers
                      </p>
                    </div>
                    {isSignedIn && <FollowButton userId={u.id} />}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Posts */}
            {posts.length > 0 && (
              <div>
                <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
                  <FileTextIcon className="size-4 text-primary" />
                  <h2 className="font-bold text-sm">Posts</h2>
                  <span className="text-xs text-muted-foreground ml-auto">{posts.length} results</span>
                </div>
                {posts.map((post: any, i: number) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: users.length * 0.04 + i * 0.05 }}
                  >
                    <PostCard post={post} dbUserId={dbUserId} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* No results */}
            {!hasResults && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center px-6"
              >
                <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <SearchIcon className="size-7 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-2">No results for No results for "{query}"ldquo;{query}No results for "{query}"rdquo;</h3>
                <p className="text-muted-foreground text-sm">Try different keywords or check your spelling.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
