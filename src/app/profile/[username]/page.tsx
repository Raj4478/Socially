import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeartIcon, ImageIcon, PenLineIcon } from "lucide-react";
import { getProfile, getProfilePosts } from "@/actions/profile.action";
import { getViewerId } from "@/lib/auth";
import type { ProfileTab } from "@/lib/types";
import { displayName } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import ProfileHeader from "@/components/ProfileHeader";
import TabLinks from "@/components/TabLinks";
import Feed from "@/components/Feed";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ username: string }>; searchParams: Promise<{ tab?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfile(decodeURIComponent((await params).username));
  if (!profile) return { title: "Profile not found" };
  const title = `${displayName(profile)} (@${profile.username})`;
  const description = profile.bio || `See what ${displayName(profile)} is sharing on Socially.`;
  return {
    title,
    description,
    openGraph: { type: "profile", title, description, ...(profile.image ? { images: [profile.image] } : {}) },
  };
}

const EMPTY: Record<ProfileTab, { icon: typeof PenLineIcon; mine: string; theirs: string }> = {
  posts: { icon: PenLineIcon, mine: "You haven't posted yet", theirs: "No posts yet" },
  media: { icon: ImageIcon, mine: "Photos you post will show up here", theirs: "No photos yet" },
  likes: { icon: HeartIcon, mine: "Posts you like will show up here", theirs: "No liked posts yet" },
};

export default async function ProfilePage({ params, searchParams }: Props) {
  const username = decodeURIComponent((await params).username);
  const rawTab = (await searchParams).tab;
  const tab: ProfileTab = rawTab === "media" || rawTab === "likes" ? rawTab : "posts";

  const [profile, viewerId] = await Promise.all([getProfile(username), getViewerId()]);
  if (!profile) notFound();
  const initial = await getProfilePosts(profile.id, tab);
  const base = `/profile/${profile.username}`;
  const empty = EMPTY[tab];

  return (
    <>
      <PageHeader title={displayName(profile)} subtitle={`${profile.postCount} post${profile.postCount === 1 ? "" : "s"}`} back />
      <ProfileHeader profile={profile} />
      <div className="border-b">
        <TabLinks
          active={tab}
          tabs={[
            { value: "posts", label: "Posts", href: base },
            { value: "media", label: "Media", href: `${base}?tab=media` },
            { value: "likes", label: "Likes", href: `${base}?tab=likes` },
          ]}
        />
      </div>
      <Feed
        key={tab}
        initial={initial}
        loadMore={getProfilePosts.bind(null, profile.id, tab)}
        viewerId={viewerId}
        empty={<EmptyState icon={empty.icon} title={profile.isMe ? empty.mine : empty.theirs} />}
      />
    </>
  );
}
