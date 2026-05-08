"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./users.action";

const POST_INCLUDE = {
  author: { select: { id: true, name: true, username: true, image: true } },
  comments: {
    include: { author: { select: { id: true, name: true, username: true, image: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  likes: { select: { userId: true } },
  bookmarks: { select: { userId: true } },
  _count: { select: { likes: true, comments: true } },
};

export async function getProfileByUsername(username: string) {
  try {
    return await prisma.user.findUnique({
      where: { username },
      select: {
        id: true, name: true, username: true, bio: true,
        image: true, coverImage: true, location: true,
        website: true, createdAt: true,
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });
  } catch {
    return null;
  }
}

export async function getUserPosts(userId: string) {
  try {
    return await prisma.post.findMany({
      where: { authorId: userId },
      include: POST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getUserLikedPosts(userId: string) {
  try {
    return await prisma.post.findMany({
      where: { likes: { some: { userId } } },
      include: POST_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return { success: false, error: "Unauthorized" };

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;
    const coverImage = formData.get("coverImage") as string;

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        ...(name && { name }),
        bio: bio ?? undefined,
        location: location ?? undefined,
        website: website ?? undefined,
        coverImage: coverImage ?? undefined,
      },
    });
    revalidatePath("/profile");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;
    const follow = await prisma.follows.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: userId } },
    });
    return !!follow;
  } catch {
    return false;
  }
}
