"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2Icon } from "lucide-react";
import type { Page, PostDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import PostCard from "./PostCard";

/**
 * Infinite list of posts. The first page is rendered on the server; later pages are
 * fetched through `loadMore` (a server action bound to this feed's filter).
 */
export default function Feed({
  initial,
  loadMore,
  viewerId,
  empty,
  prepend,
}: {
  initial: Page<PostDTO>;
  loadMore: (cursor: string) => Promise<Page<PostDTO>>;
  viewerId: string | null;
  empty?: ReactNode;
  /** Posts created on this page (e.g. by the composer) shown above the rest. */
  prepend?: PostDTO[];
}) {
  const [posts, setPosts] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const { ref, inView } = useInView({ rootMargin: "600px" });

  // A new first page (tab switch, refresh) replaces the list.
  useEffect(() => {
    setPosts(initial.items);
    setCursor(initial.nextCursor);
  }, [initial]);

  const fetchMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    setFailed(false);
    try {
      const page = await loadMore(cursor);
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.items.filter((p) => !seen.has(p.id))];
      });
      setCursor(page.nextCursor);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, loadMore]);

  useEffect(() => {
    if (inView && !failed) fetchMore();
  }, [inView, failed, fetchMore]);

  const fresh = (prepend ?? []).filter((p) => !posts.some((x) => x.id === p.id));
  const all = [...fresh, ...posts];

  if (all.length === 0 && !cursor) return <>{empty}</>;

  return (
    <div>
      {all.map((post) => (
        <PostCard key={post.id} post={post} viewerId={viewerId} />
      ))}
      {cursor && (
        <div ref={ref} className="flex justify-center py-6">
          {failed ? (
            <Button variant="outline" size="sm" onClick={() => fetchMore()}>Try again</Button>
          ) : (
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" aria-label="Loading more posts" />
          )}
        </div>
      )}
      {!cursor && all.length > 5 && <p className="py-8 text-center text-sm text-muted-foreground">You're all caught up</p>}
    </div>
  );
}
