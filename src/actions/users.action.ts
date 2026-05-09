"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return null;

    const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (existingUser) return existingUser;

    const baseUsername =
      user.username ??
      user.emailAddresses[0]?.emailAddress.split("@")[0] ??
      `user_${userId.slice(-8)}`;

    let username = baseUsername;
    let attempt = 0;
    while (await prisma.user.findUnique({ where: { username } })) {
      attempt++;
      username = `${baseUsername}${attempt}`;
    }

    return await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || username,
        username,
        image: user.imageUrl ?? "",
        email: user.emailAddresses[0]?.emailAddress ?? "",
      },
    });
  } catch (error) {
    console.error("[syncUser] error:", error);
    return null;
  }
}

export async function getUserByClerkId(clerkId: string) {
  try {
    return await prisma.user.findUnique({
      where: { clerkId },
      include: {
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });
  } catch {
    return null;
  }
}

export async function getDbUserId(): Promise<string | null> {
  try {
    const authResult = await auth();
    const clerkId = authResult?.userId;

    if (!clerkId) {
      console.log("[getDbUserId] No clerkId from auth()");
      return null;
    }

    // Try to find user in DB
    let dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    // Auto-create if missing
    if (!dbUser) {
      console.log("[getDbUserId] User not in DB, syncing...");
      const synced = await syncUser();
      if (synced) {
        dbUser = { id: synced.id };
      }
    }

    return dbUser?.id ?? null;
  } catch (error) {
    console.error("[getDbUserId] error:", error);
    return null;
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return { success: false, error: "Not authenticated" };
    if (userId === targetUserId) return { success: false, error: "Cannot follow yourself" };

    const existing = await prisma.follows.findUnique({
      where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
    });

    if (existing) {
      await prisma.follows.delete({
        where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
      });
    } else {
      await prisma.$transaction([
        prisma.follows.create({ data: { followerId: userId, followingId: targetUserId } }),
        prisma.notification.create({
          data: { type: "FOLLOW", userId: targetUserId, creatorId: userId },
        }),
      ]);
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[toggleFollow] error:", error);
    return { success: false };
  }
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    return await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { NOT: { followers: { some: { followerId: userId } } } },
        ],
      },
      select: {
        id: true, name: true, username: true, image: true, bio: true,
        _count: { select: { followers: true } },
      },
      take: 5,
      orderBy: { followers: { _count: "desc" } },
    });
  } catch (error) {
    console.error("[getRandomUsers] error:", error);
    return [];
  }
}

export async function searchUsers(query: string) {
  try {
    if (!query?.trim()) return [];
    return await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true, name: true, username: true, image: true, bio: true,
        _count: { select: { followers: true, following: true, posts: true } },
      },
      take: 10,
    });
  } catch {
    return [];
  }
}
