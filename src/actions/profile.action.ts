"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { runAction, safeQuery, type ActionResult } from "@/lib/action";
import { getViewerId, requireViewer } from "@/lib/auth";
import { emptyPage, findPostPage } from "@/lib/posts";
import { id, profileInput, type ProfileInput } from "@/lib/validation";
import type { Page, PostDTO, ProfileDTO, ProfileTab } from "@/lib/types";

export async function getProfile(username: string): Promise<ProfileDTO | null> {
  return safeQuery("getProfile", null, async () => {
    const handle = username.trim().toLowerCase();
    if (!handle || handle.length > 40) return null;
    const viewerId = await getViewerId();
    const user = await prisma.user.findFirst({
      where: { username: { equals: handle, mode: "insensitive" } },
      select: {
        id: true, name: true, username: true, bio: true, image: true, coverImage: true,
        location: true, website: true, createdAt: true,
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });
    if (!user) return null;

    const [isFollowing, followsMe] = viewerId && viewerId !== user.id
      ? await Promise.all([
          prisma.follows.count({ where: { followerId: viewerId, followingId: user.id } }),
          prisma.follows.count({ where: { followerId: user.id, followingId: viewerId } }),
        ])
      : [0, 0];

    const { _count, createdAt, ...rest } = user;
    return {
      ...rest,
      createdAt: createdAt.toISOString(),
      postCount: _count.posts,
      followerCount: _count.followers,
      followingCount: _count.following,
      isMe: viewerId === user.id,
      isFollowing: isFollowing > 0,
      followsMe: followsMe > 0,
    };
  });
}

export async function getProfilePosts(userId: string, tab: ProfileTab, cursor?: string | null): Promise<Page<PostDTO>> {
  return safeQuery("getProfilePosts", emptyPage<PostDTO>(), async () => {
    const viewerId = await getViewerId();
    const uid = id.parse(userId);
    const where =
      tab === "likes" ? { likes: { some: { userId: uid } } }
      : tab === "media" ? { authorId: uid, image: { not: null }, NOT: { image: "" } }
      : { authorId: uid };
    return findPostPage(where, viewerId, cursor);
  });
}

export async function updateProfile(input: ProfileInput): Promise<ActionResult<{ username: string }>> {
  return runAction("updateProfile", async () => {
    const viewer = await requireViewer();
    const data = profileInput.parse(input);
    const user = await prisma.user.update({
      where: { id: viewer.id },
      data: {
        name: data.name,
        bio: data.bio || null,
        location: data.location || null,
        website: data.website || null,
        coverImage: data.coverImage || null,
      },
      select: { username: true },
    });
    revalidatePath(`/profile/${user.username}`);
    return user;
  });
}
