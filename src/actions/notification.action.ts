"use server";

import prisma from "@/lib/prisma";
import { runAction, safeQuery, type ActionResult } from "@/lib/action";
import { getViewerId, requireViewer } from "@/lib/auth";
import { USER_SUMMARY } from "@/lib/posts";
import type { NotificationDTO, Page } from "@/lib/types";

const PAGE = 30;

export async function getNotifications(cursor?: string | null): Promise<Page<NotificationDTO>> {
  return safeQuery("getNotifications", { items: [], nextCursor: null }, async () => {
    const viewerId = await getViewerId();
    if (!viewerId) return { items: [], nextCursor: null };
    const rows = await prisma.notification.findMany({
      where: { userId: viewerId },
      include: {
        creator: { select: USER_SUMMARY },
        post: { select: { id: true, content: true, image: true } },
        comment: { select: { id: true, content: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: PAGE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const items = rows.slice(0, PAGE).map((n) => ({
      id: n.id,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      creator: n.creator,
      post: n.post,
      comment: n.comment,
    }));
    return { items, nextCursor: rows.length > PAGE ? items[items.length - 1].id : null };
  });
}

export async function getUnreadCount(): Promise<number> {
  return safeQuery("getUnreadCount", 0, async () => {
    const viewerId = await getViewerId();
    if (!viewerId) return 0;
    return prisma.notification.count({ where: { userId: viewerId, read: false } });
  });
}

/** Marks the viewer's own notifications as read. (v1 accepted any ids from the client.) */
export async function markAllNotificationsRead(): Promise<ActionResult<{ count: number }>> {
  return runAction("markAllNotificationsRead", async () => {
    const viewer = await requireViewer();
    const { count } = await prisma.notification.updateMany({
      where: { userId: viewer.id, read: false },
      data: { read: true },
    });
    return { count };
  });
}
