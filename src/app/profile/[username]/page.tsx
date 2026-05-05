import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from "@/actions/profile.action";
import { getDbUserId } from "@/actions/users.action";
import ProfilePageClient from "./ProfilePageClient";
import { notFound } from "next/navigation";

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [user, dbUserId] = await Promise.all([
    getProfileByUsername(username),
    getDbUserId().catch(() => null),
  ]);

  if (!user) notFound();

  const [posts, likedPosts, followingStatus] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={followingStatus}
      dbUserId={dbUserId}
    />
  );
}
