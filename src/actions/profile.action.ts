"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./users.action";

export async function getProfileByUsername(username: string) {
  try {
    return await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        coverImage: true,
        location: true,
        website: true,
        createdAt: true,
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });
  } catch (error) {
    throw new Error("Failed to fetch profile");
  }
}

export async function getUserPosts(userId: string) {
  try {
    return await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        comments: {
          include: { author: { select: { id: true, name: true, username: true, image: true } } },
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { userId: true } },
        bookmarks: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw new Error("Failed to fetch user posts");
  }
}

export async function getUserLikedPosts(userId: string) {
  try {
    return await prisma.post.findMany({
      where: { likes: { some: { userId } } },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        comments: {
          include: { author: { select: { id: true, name: true, username: true, image: true } } },
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { userId: true } },
        bookmarks: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    throw new Error("Failed to fetch liked posts");
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        name: formData.get("name") as string,
        bio: formData.get("bio") as string,
        location: formData.get("location") as string,
        website: formData.get("website") as string,
        coverImage: (formData.get("coverImage") as string) || undefined,
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
      where: {
        followerId_followingId: { followerId: currentUserId, followingId: userId },
      },
    });
    return !!follow;
  } catch {
    return false;
  }
}
