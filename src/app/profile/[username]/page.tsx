export const dynamic = "force-dynamic";

import {
  getProfileByUsername,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import { getDbUserId } from "@/actions/users.action";
import ProfilePageClient from "./ProfilePageClient";
import { notFound } from "next/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  if (!username) notFound();

  const [user, dbUserId] = await Promise.all([
    getProfileByUsername(username),
    getDbUserId(),
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
      posts={posts as any}
      likedPosts={likedPosts as any}
      isFollowing={followingStatus}
      dbUserId={dbUserId}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getProfileByUsername(username);
  if (!user) return { title: "Profile not found" };
  return {
    title: `${user.name ?? user.username} (@${user.username})`,
    description: user.bio ?? `Check out ${user.username}'s profile on Socially`,
  };
}
