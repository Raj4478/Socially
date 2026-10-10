"use server";

import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { ActionError, runAction, safeQuery, type ActionResult } from "@/lib/action";
import { getViewerId, requireViewer } from "@/lib/auth";
import { limit } from "@/lib/rate-limit";
import { findPostPage, emptyPage, postSelect, toCommentDTO, toPostDTO, USER_SUMMARY } from "@/lib/posts";
import { commentInput, feedTab, id, postEditInput, postInput, searchQuery, type PostInput } from "@/lib/validation";
import { extractHashtags, normalizeTag, topHashtags } from "@/lib/content";
import type { CommentDTO, Page, PostDTO } from "@/lib/types";

// ── Reads ────────────────────────────────────────────────────────────────

export async function getFeed(tab: string, cursor?: string | null): Promise<Page<PostDTO>> {
  return safeQuery("getFeed", emptyPage<PostDTO>(), async () => {
    const viewerId = await getViewerId();
    if (feedTab.parse(tab) === "following") {
      if (!viewerId) return emptyPage<PostDTO>();
      const follows = await prisma.follows.findMany({ where: { followerId: viewerId }, select: { followingId: true } });
      const authorIds = [viewerId, ...follows.map((f) => f.followingId)];
      return findPostPage({ authorId: { in: authorIds } }, viewerId, cursor);
    }
    return findPostPage({}, viewerId, cursor);
  });
}

export async function getPost(postId: string): Promise<PostDTO | null> {
  return safeQuery("getPost", null, async () => {
    const viewerId = await getViewerId();
    const row = await prisma.post.findUnique({ where: { id: id.parse(postId) }, select: postSelect(viewerId) });
    return row ? toPostDTO(row) : null;
  });
}

export async function getTagPosts(tag: string, cursor?: string | null): Promise<Page<PostDTO>> {
  return safeQuery("getTagPosts", emptyPage<PostDTO>(), async () => {
    const viewerId = await getViewerId();
    const normalized = normalizeTag(tag);
    if (!normalized) return emptyPage<PostDTO>();
    // "contains" also matches #tagged when looking for #tag; the word-boundary check
    // trims those out so the page only shows exact tags.
    const page = await findPostPage({ content: { contains: `#${normalized}`, mode: "insensitive" } }, viewerId, cursor);
    return { ...page, items: page.items.filter((p) => extractHashtags(p.content).includes(normalized)) };
  });
}

export async function getBookmarks(cursor?: string | null): Promise<Page<PostDTO>> {
  return safeQuery("getBookmarks", emptyPage<PostDTO>(), async () => {
    const viewerId = await getViewerId();
    if (!viewerId) return emptyPage<PostDTO>();
    return findPostPage({ bookmarks: { some: { userId: viewerId } } }, viewerId, cursor);
  });
}

export async function searchPosts(query: string): Promise<PostDTO[]> {
  return safeQuery("searchPosts", [], async () => {
    const q = searchQuery.parse(query);
    if (!q) return [];
    const viewerId = await getViewerId();
    const page = await findPostPage(
      {
        OR: [
          { content: { contains: q, mode: "insensitive" } },
          { author: { name: { contains: q, mode: "insensitive" } } },
          { author: { username: { contains: q, mode: "insensitive" } } },
        ],
      },
      viewerId,
      null,
      20
    );
    return page.items;
  });
}

const trendingTags = unstable_cache(
  async () => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = await prisma.post.findMany({
      where: { createdAt: { gte: since }, content: { contains: "#" } },
      select: { content: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return topHashtags(recent.map((p) => p.content), 8);
  },
  ["trending-tags"],
  { revalidate: 300, tags: ["trending"] }
);

export async function getTrendingTags(): Promise<{ tag: string; count: number }[]> {
  return safeQuery("getTrendingTags", [], () => trendingTags());
}

export async function getComments(postId: string): Promise<CommentDTO[]> {
  return safeQuery("getComments", [], async () => {
    const viewerId = await getViewerId();
    const post = await prisma.post.findUnique({
      where: { id: id.parse(postId) },
      select: {
        authorId: true,
        comments: { include: { author: { select: USER_SUMMARY } }, orderBy: { createdAt: "asc" }, take: 200 },
      },
    });
    if (!post) return [];
    return post.comments.map((c) => toCommentDTO(c, viewerId, post.authorId));
  });
}

// ── Writes ───────────────────────────────────────────────────────────────

export async function createPost(input: PostInput): Promise<ActionResult<PostDTO>> {
  return runAction("createPost", async () => {
    const viewer = await requireViewer();
    limit("post", viewer.id);
    const { content, image } = postInput.parse(input);
    const row = await prisma.post.create({
      data: { content: content || null, image: image || null, authorId: viewer.id },
      select: postSelect(viewer.id),
    });
    return toPostDTO(row);
  });
}

export async function updatePost(postId: string, content: string): Promise<ActionResult<PostDTO>> {
  return runAction("updatePost", async () => {
    const viewer = await requireViewer();
    limit("post", viewer.id);
    const parsed = postEditInput.parse({ content });
    const post = await prisma.post.findUnique({ where: { id: id.parse(postId) }, select: { authorId: true, image: true } });
    if (!post) throw new ActionError("This post no longer exists");
    if (post.authorId !== viewer.id) throw new ActionError("You can only edit your own posts");
    if (!parsed.content && !post.image) throw new ActionError("A post without a photo needs some text");

    const row = await prisma.post.update({
      where: { id: postId },
      data: { content: parsed.content || null },
      select: postSelect(viewer.id),
    });
    return toPostDTO(row);
  });
}

export async function deletePost(postId: string): Promise<ActionResult> {
  return runAction("deletePost", async () => {
    const viewer = await requireViewer();
    const post = await prisma.post.findUnique({ where: { id: id.parse(postId) }, select: { authorId: true } });
    if (!post) throw new ActionError("This post no longer exists");
    if (post.authorId !== viewer.id) throw new ActionError("You can only delete your own posts");
    await prisma.post.delete({ where: { id: postId } });
    return null;
  });
}

export async function toggleLike(postId: string): Promise<ActionResult<{ liked: boolean; likeCount: number }>> {
  return runAction("toggleLike", async () => {
    const viewer = await requireViewer();
    limit("reaction", viewer.id);
    const post = await prisma.post.findUnique({ where: { id: id.parse(postId) }, select: { authorId: true } });
    if (!post) throw new ActionError("This post no longer exists");

    const key = { userId_postId: { userId: viewer.id, postId } };
    const existing = await prisma.like.findUnique({ where: key });
    if (existing) {
      await prisma.$transaction([
        prisma.like.delete({ where: key }),
        // Unliking removes the notification it created, so re-liking doesn't spam the author.
        prisma.notification.deleteMany({ where: { type: "LIKE", postId, creatorId: viewer.id } }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.like.create({ data: { userId: viewer.id, postId } }),
        ...(post.authorId !== viewer.id
          ? [prisma.notification.create({ data: { type: "LIKE", userId: post.authorId, creatorId: viewer.id, postId } })]
          : []),
      ]);
    }
    const likeCount = await prisma.like.count({ where: { postId } });
    return { liked: !existing, likeCount };
  });
}

export async function toggleBookmark(postId: string): Promise<ActionResult<{ bookmarked: boolean }>> {
  return runAction("toggleBookmark", async () => {
    const viewer = await requireViewer();
    limit("reaction", viewer.id);
    const key = { userId_postId: { userId: viewer.id, postId: id.parse(postId) } };
    const existing = await prisma.bookmark.findUnique({ where: key });
    if (existing) {
      await prisma.bookmark.delete({ where: key });
    } else {
      const exists = await prisma.post.count({ where: { id: postId } });
      if (!exists) throw new ActionError("This post no longer exists");
      await prisma.bookmark.create({ data: { userId: viewer.id, postId } });
    }
    return { bookmarked: !existing };
  });
}

export async function createComment(postId: string, content: string): Promise<ActionResult<CommentDTO>> {
  return runAction("createComment", async () => {
    const viewer = await requireViewer();
    limit("comment", viewer.id);
    const parsed = commentInput.parse({ content });
    const post = await prisma.post.findUnique({ where: { id: id.parse(postId) }, select: { authorId: true } });
    if (!post) throw new ActionError("This post no longer exists");

    const comment = await prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: { content: parsed.content, authorId: viewer.id, postId },
        include: { author: { select: USER_SUMMARY } },
      });
      if (post.authorId !== viewer.id) {
        await tx.notification.create({
          data: { type: "COMMENT", userId: post.authorId, creatorId: viewer.id, postId, commentId: created.id },
        });
      }
      return created;
    });
    return toCommentDTO(comment, viewer.id, post.authorId);
  });
}

export async function deleteComment(commentId: string): Promise<ActionResult> {
  return runAction("deleteComment", async () => {
    const viewer = await requireViewer();
    const comment = await prisma.comment.findUnique({
      where: { id: id.parse(commentId) },
      select: { authorId: true, post: { select: { authorId: true } } },
    });
    if (!comment) throw new ActionError("This comment no longer exists");
    if (comment.authorId !== viewer.id && comment.post.authorId !== viewer.id) {
      throw new ActionError("You can't delete this comment");
    }
    await prisma.comment.delete({ where: { id: commentId } });
    return null;
  });
}
