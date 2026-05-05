"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName} ${user.lastName}`,
        username: user.username || user.emailAddresses[0]?.emailAddress.split("@")[0] || "",
        image: user.imageUrl || "",
        email: user.emailAddresses[0]?.emailAddress || "",
      },
    });
    return dbUser;
  } catch (error) {
    console.error("Error syncing user:", error);
    throw new Error("Failed to sync user");
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      _count: { select: { followers: true, following: true, posts: true } },
    },
  });
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");
  return user.id;
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) throw new Error("User not found");
    if (userId === targetUserId) throw new Error("Cannot follow yourself");

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
    console.error("Error in toggleFollow", error);
    return { success: false };
  }
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    return prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          { NOT: { followers: { some: { followerId: userId } } } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        _count: { select: { followers: true } },
      },
      take: 5,
      orderBy: { followers: { _count: "desc" } },
    });
  } catch (error) {
    console.error("Error fetching random users:", error);
    return [];
  }
}

export async function searchUsers(query: string) {
  try {
    if (!query.trim()) return [];
    return prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        _count: { select: { followers: true, following: true, posts: true } },
      },
      take: 10,
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}
