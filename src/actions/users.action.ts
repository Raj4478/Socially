"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const authResult = await auth();
    const clerkId = authResult?.userId;
    const user = await currentUser();

    console.log("[syncUser] clerkId:", clerkId, "user email:", user?.emailAddresses?.[0]?.emailAddress);

    if (!clerkId || !user) {
      console.log("[syncUser] No auth - skipping sync");
      return null;
    }

    const existingUser = await prisma.user.findUnique({ where: { clerkId } });
    if (existingUser) {
      console.log("[syncUser] User already exists:", existingUser.id, existingUser.username);
      return existingUser;
    }

    const baseUsername =
      user.username ??
      user.emailAddresses[0]?.emailAddress.split("@")[0] ??
      `user_${clerkId.slice(-8)}`;

    let username = baseUsername;
    let attempt = 0;
    while (await prisma.user.findUnique({ where: { username } })) {
      attempt++;
      username = `${baseUsername}${attempt}`;
    }

    const created = await prisma.user.create({
      data: {
        clerkId,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || username,
        username,
        image: user.imageUrl ?? "",
        email: user.emailAddresses[0]?.emailAddress ?? "",
      },
    });
    console.log("[syncUser] Created new user:", created.id, created.username);
    return created;
  } catch (error: any) {
    console.error("[syncUser] FAILED:", error.message, error.stack);
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
  } catch (error: any) {
    console.error("[getUserByClerkId] error:", error.message);
    return null;
  }
}

export async function getDbUserId(): Promise<string | null> {
  try {
    const authResult = await auth();
    const clerkId = authResult?.userId;
    console.log("[getDbUserId] clerkId:", clerkId);

    if (!clerkId) return null;

    let dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!dbUser) {
      console.log("[getDbUserId] Not in DB, auto-syncing...");
      const synced = await syncUser();
      if (synced) dbUser = { id: synced.id };
    }

    console.log("[getDbUserId] returning:", dbUser?.id ?? null);
    return dbUser?.id ?? null;
  } catch (error: any) {
    console.error("[getDbUserId] FAILED:", error.message);
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
  } catch (error: any) {
    console.error("[toggleFollow] error:", error.message);
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
  } catch (error: any) {
    console.error("[getRandomUsers] error:", error.message);
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
