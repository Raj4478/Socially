import type { Metadata } from "next";
import { BookmarkIcon } from "lucide-react";
import { getBookmarks } from "@/actions/post.action";
import { getViewer } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import Feed from "@/components/Feed";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const [viewer, initial] = await Promise.all([getViewer(), getBookmarks()]);

  return (
    <>
      <PageHeader title="Bookmarks" subtitle={viewer ? `@${viewer.username}` : undefined} />
      <Feed
        initial={initial}
        loadMore={getBookmarks}
        viewerId={viewer?.id ?? null}
        empty={
          <EmptyState
            icon={BookmarkIcon}
            title="Save posts for later"
            description="Tap the bookmark icon on any post to keep it here. Only you can see your bookmarks."
          />
        }
      />
    </>
  );
}
