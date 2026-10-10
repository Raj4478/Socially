import { Prisma } from "@prisma/client";
import prisma from "./prisma";
import type { CommentDTO, Page, PostDTO } from "./types";

export const PAGE_SIZE = 15;

export const USER_SUMMARY = { id: true, name: true, username: true, image: true } as const;

/**
 * Selects what a post card needs. Likes/bookmarks are filtered to the viewer, so we read
 * one row at most instead of every like on the post.
 */
export function postSelect(viewerId: string | null) {
  const mine = { where: { userId: viewerId ?? "__anonymous__" }, select: { userId: true }, take: 1 };
  return {
    id: true,
    content: true,
    image: true,
    createdAt: true,
    updatedAt: true,
    author: { select: USER_SUMMARY },
    _count: { select: { likes: true, comments: true } },
    likes: mine,
    bookmarks: mine,
  } satisfies Prisma.PostSelect;
}

type PostRow = Prisma.PostGetPayload<{ select: ReturnType<typeof postSelect> }>;

export function toPostDTO(row: PostRow): PostDTO {
  return {
    id: row.id,
    content: row.content,
    image: row.image || null,
    createdAt: row.createdAt.toISOString(),
    // Likes and comments live in other tables, so updatedAt only moves when the text is edited.
    edited: row.updatedAt.getTime() - row.createdAt.getTime() > 2000,
    author: row.author,
    likeCount: row._count.likes,
    commentCount: row._count.comments,
    likedByMe: row.likes.length > 0,
    bookmarkedByMe: row.bookmarks.length > 0,
  };
}

/** Newest-first keyset pagination over posts matching `where`. */
export async function findPostPage(
  where: Prisma.PostWhereInput,
  viewerId: string | null,
  cursor?: string | null,
  take = PAGE_SIZE
): Promise<Page<PostDTO>> {
  const rows = await prisma.post.findMany({
    where,
    select: postSelect(viewerId),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
  const hasMore = rows.length > take;
  const items = rows.slice(0, take).map(toPostDTO);
  return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
}

export type CommentRow = Prisma.CommentGetPayload<{ include: { author: { select: typeof USER_SUMMARY } } }>;

export function toCommentDTO(row: CommentRow, viewerId: string | null, postAuthorId: string): CommentDTO {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
    postId: row.postId,
    author: row.author,
    // Authors can delete their own comments; post owners can moderate their threads.
    canDelete: !!viewerId && (row.authorId === viewerId || postAuthorId === viewerId),
  };
}

export const emptyPage = <T,>(): Page<T> => ({ items: [], nextCursor: null });
