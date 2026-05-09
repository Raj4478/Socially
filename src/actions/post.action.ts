"use server";

import prisma from "@/lib/prisma";
import { getDbUserId, syncUser } from "./users.action";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

const POST_INCLUDE = {
  author: { select: { id: true, name: true, username: true, image: true } },
  comments: {
    include: { author: { select: { id: true, name: true, username: true, image: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  likes: { select: { userId: true } },
  bookmarks: { select: { userId: true } },
  _count: { select: { comments: true, likes: true, bookmarks: true } },
};

async function requireUserId(): Promise<string> {
  // Try getDbUserId first (auto-syncs if missing)
  let userId = await getDbUserId();
  if (userId) return userId;

  // Last resort: check Clerk directly and sync
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated — please sign in");

  // Force sync
  const synced = await syncUser();
  if (!synced) throw new Error("Failed to initialize user account");

  return synced.id;
}

export async function createPost(content: string, image: string) {
  try {
    const userId = await requireUserId();
    const post = await prisma.post.create({
      data: { content, image, authorId: userId },
    });
    revalidatePath("/");
    return { success: true, post };
  } catch (error: any) {
    console.error("[createPost] error:", error);
    return { success: false, error: error.message || "Failed to create post" };
  }
}

export async function getPosts() {
  try {
    return await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: POST_INCLUDE,
    });
  } catch (error) {
    console.error("[getPosts] error:", error);
    return [];
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await requireUserId();

    const [existingLike, post] = await Promise.all([
      prisma.like.findUnique({ where: { userId_postId: { userId, postId } } }),
      prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } }),
    ]);
    if (!post) return { success: false, error: "Post not found" };

    if (existingLike) {
      await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
    } else {
      await prisma.$transaction([
        prisma.like.create({ data: { userId, postId } }),
        ...(post.authorId !== userId
          ? [prisma.notification.create({
              data: { type: "LIKE", userId: post.authorId, creatorId: userId, postId },
            })]
          : []),
      ]);
    }
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[toggleLike] error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleBookmark(postId: string) {
  try {
    const userId = await requireUserId();

    const existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (existing) {
      await prisma.bookmark.delete({ where: { userId_postId: { userId, postId } } });
      revalidatePath("/");
      return { success: true, bookmarked: false };
    } else {
      await prisma.bookmark.create({ data: { userId, postId } });
      revalidatePath("/");
      return { success: true, bookmarked: true };
    }
  } catch (error: any) {
    console.error("[toggleBookmark] error:", error);
    return { success: false, error: error.message };
  }
}

export async function getBookmarkedPosts() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { post: { include: POST_INCLUDE } },
    });
    return bookmarks.map((b) => b.post);
  } catch (error) {
    console.error("[getBookmarkedPosts] error:", error);
    return [];
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await requireUserId();
    if (!content?.trim()) return { success: false, error: "Content required" };

    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (!post) return { success: false, error: "Post not found" };

    const comment = await prisma.comment.create({ data: { content, authorId: userId, postId } });
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: { type: "COMMENT", userId: post.authorId, creatorId: userId, postId, commentId: comment.id },
      });
    }
    revalidatePath("/");
    return { success: true, comment };
  } catch (error: any) {
    console.error("[createComment] error:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await requireUserId();
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
    if (!post) return { success: false, error: "Post not found" };
    if (post.authorId !== userId) return { success: false, error: "Unauthorized" };
    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("[deletePost] error:", error);
    return { success: false, error: error.message };
  }
}

export async function searchPosts(query: string) {
  try {
    if (!query?.trim()) return [];
    return await prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: query, mode: "insensitive" } },
          { author: { name: { contains: query, mode: "insensitive" } } },
          { author: { username: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: POST_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch (error) {
    console.error("[searchPosts] error:", error);
    return [];
  }
}
