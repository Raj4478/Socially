"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./users.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "User not found" };

    const post = await prisma.post.create({
      data: { content, image, authorId: userId },
    });

    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error };
  }
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, username: true, image: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { userId: true } },
        bookmarks: { select: { userId: true } },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
      },
    });
    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) throw new Error("Post not found");

    if (existingLike) {
      await prisma.like.delete({
        where: { userId_postId: { userId, postId } },
      });
    } else {
      await prisma.$transaction([
        prisma.like.create({ data: { userId, postId } }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: { type: "LIKE", userId: post.authorId, creatorId: userId, postId },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function toggleBookmark(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Not authenticated" };

    const existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { userId_postId: { userId, postId } },
      });
      revalidatePath("/");
      return { success: true, bookmarked: false };
    } else {
      await prisma.bookmark.create({ data: { userId, postId } });
      revalidatePath("/");
      return { success: true, bookmarked: true };
    }
  } catch (error) {
    console.error("Failed to toggle bookmark:", error);
    return { success: false, error: "Failed to toggle bookmark" };
  }
}

export async function getBookmarkedPosts() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          include: {
            author: {
              select: { id: true, name: true, username: true, image: true },
            },
            comments: {
              include: {
                author: {
                  select: { id: true, name: true, username: true, image: true },
                },
              },
              orderBy: { createdAt: "asc" },
            },
            likes: { select: { userId: true } },
            bookmarks: { select: { userId: true } },
            _count: { select: { comments: true, likes: true, bookmarks: true } },
          },
        },
      },
    });

    return bookmarks.map((b: any) => b.post);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return [];
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) throw new Error("Post not found");

    const [comment] = await prisma.$transaction(async (tx: any) => {
      const newComment = await tx.comment.create({
        data: { content, authorId: userId, postId },
      });
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }
      return [newComment];
    });

    revalidatePath("/");
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId) throw new Error("Unauthorized");

    await prisma.post.delete({ where: { id: postId } });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function searchPosts(query: string) {
  try {
    if (!query.trim()) return [];
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { content: { contains: query, mode: "insensitive" } },
          { author: { name: { contains: query, mode: "insensitive" } } },
          { author: { username: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        author: { select: { id: true, name: true, username: true, image: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, username: true, image: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        likes: { select: { userId: true } },
        bookmarks: { select: { userId: true } },
        _count: { select: { comments: true, likes: true, bookmarks: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return posts;
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
}
