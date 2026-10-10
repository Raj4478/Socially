"use server";

import prisma from "@/lib/prisma";
import { ActionError, runAction, safeQuery, type ActionResult } from "@/lib/action";
import { getViewerId, requireViewer } from "@/lib/auth";
import { limit } from "@/lib/rate-limit";
import { id, searchQuery } from "@/lib/validation";
import type { SuggestedUser } from "@/lib/types";

const SUGGESTED_SELECT = {
  id: true,
  name: true,
  username: true,
  image: true,
  bio: true,
  _count: { select: { followers: true } },
} as const;

type SuggestedRow = { id: string; name: string | null; username: string; image: string | null; bio: string | null; _count: { followers: number } };
const toSuggested = ({ _count, ...u }: SuggestedRow): SuggestedUser => ({ ...u, followerCount: _count.followers });

export async function toggleFollow(targetUserId: string): Promise<ActionResult<{ following: boolean; followerCount: number }>> {
  return runAction("toggleFollow", async () => {
    const viewer = await requireViewer();
    limit("follow", viewer.id);
    const targetId = id.parse(targetUserId);
    if (targetId === viewer.id) throw new ActionError("You can't follow yourself");
    if (!(await prisma.user.count({ where: { id: targetId } }))) throw new ActionError("This account no longer exists");

    const key = { followerId_followingId: { followerId: viewer.id, followingId: targetId } };
    const existing = await prisma.follows.findUnique({ where: key });
    if (existing) {
      await prisma.$transaction([
        prisma.follows.delete({ where: key }),
        prisma.notification.deleteMany({ where: { type: "FOLLOW", userId: targetId, creatorId: viewer.id } }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.follows.create({ data: { followerId: viewer.id, followingId: targetId } }),
        prisma.notification.create({ data: { type: "FOLLOW", userId: targetId, creatorId: viewer.id } }),
      ]);
    }
    const followerCount = await prisma.follows.count({ where: { followingId: targetId } });
    return { following: !existing, followerCount };
  });
}

/** Popular people the viewer doesn't follow yet (or just popular people for visitors). */
export async function getSuggestions(take = 5): Promise<SuggestedUser[]> {
  return safeQuery("getSuggestions", [], async () => {
    const viewerId = await getViewerId();
    const rows = await prisma.user.findMany({
      where: viewerId ? { id: { not: viewerId }, followers: { none: { followerId: viewerId } } } : {},
      select: SUGGESTED_SELECT,
      orderBy: [{ followers: { _count: "desc" } }, { createdAt: "desc" }],
      take,
    });
    return rows.map(toSuggested);
  });
}

export async function searchUsers(query: string): Promise<SuggestedUser[]> {
  return safeQuery("searchUsers", [], async () => {
    const q = searchQuery.parse(query).replace(/^@/, "");
    if (!q) return [];
    const rows = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
          { bio: { contains: q, mode: "insensitive" } },
        ],
      },
      select: SUGGESTED_SELECT,
      orderBy: { followers: { _count: "desc" } },
      take: 10,
    });
    return rows.map(toSuggested);
  });
}

/** Which of these users the viewer already follows (for rendering Follow buttons). */
export async function getFollowingIds(userIds: string[]): Promise<string[]> {
  return safeQuery("getFollowingIds", [], async () => {
    const viewerId = await getViewerId();
    if (!viewerId || userIds.length === 0) return [];
    const rows = await prisma.follows.findMany({
      where: { followerId: viewerId, followingId: { in: userIds.slice(0, 100) } },
      select: { followingId: true },
    });
    return rows.map((r) => r.followingId);
  });
}
