import type { Metadata } from "next";
import { HashIcon } from "lucide-react";
import { getTagPosts } from "@/actions/post.action";
import { getViewerId } from "@/lib/auth";
import { normalizeTag } from "@/lib/content";
import PageHeader from "@/components/PageHeader";
import Feed from "@/components/Feed";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = normalizeTag(decodeURIComponent((await params).tag));
  return { title: `#${tag}`, description: `Posts tagged #${tag} on Socially` };
}

export default async function TagPage({ params }: Props) {
  const tag = normalizeTag(decodeURIComponent((await params).tag));
  const [initial, viewerId] = await Promise.all([getTagPosts(tag), getViewerId()]);

  return (
    <>
      <PageHeader title={`#${tag}`} subtitle="Latest posts" back />
      <Feed
        initial={initial}
        loadMore={getTagPosts.bind(null, tag)}
        viewerId={viewerId}
        empty={
          <EmptyState
            icon={HashIcon}
            title={`No posts with #${tag} yet`}
            description="Use this hashtag in a post to start the topic."
          />
        }
      />
    </>
  );
}
