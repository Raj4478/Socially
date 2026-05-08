"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./users.action";

export async function getNotifications() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    return await prisma.notification.findMany({
      where: { userId },
      include: {
        creator: { select: { id: true, name: true, username: true, image: true } },
        post: { select: { id: true, content: true, image: true } },
        comment: { select: { id: true, content: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationsAsRead(notificationIds: string[]) {
  try {
    if (!notificationIds.length) return { success: true };
    await prisma.notification.updateMany({
      where: { id: { in: notificationIds } },
      data: { read: true },
    });
    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false };
  }
}
