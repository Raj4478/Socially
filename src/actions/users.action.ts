"use server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function syncUser() {
    try {
        const { userId } = await auth();
        const user = await currentUser();
        if (!userId || !user) return;

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId,
            },
        });

        if (existingUser) {
            return existingUser; // User already exists in the database
        }

        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName} ${user.lastName}`,
                username:
                    user.username ||
                    user.emailAddresses[0]?.emailAddress.split("@")[0] ||
                    "",
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
    try {
        const user = await prisma.user.findUnique({
            where: {
                clerkId,
            },
            include: {
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true,
                    },
                },
            },
        });
        return user;
    } catch (error) {
        console.error("Error fetching user by Clerk ID:", error);
        throw new Error("Failed to fetch user");
    }
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
        if (!userId) {
            throw new Error("User not found");
        }

        if (userId === targetUserId) {
            throw new Error("You cannot follow yourself");
        }

        const existingFollow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId,
                },
            },
        });

        if (existingFollow) {
            // Unfollow the user
            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: targetUserId,
                    },
                },
            });
            return { success: true, message: "Unfollowed successfully" };
        } else {
            //follow
            await prisma.$transaction([
                prisma.follows.create({
                    data: {
                        followerId: userId,
                        followingId: targetUserId,
                    },
                }),
                prisma.notification.create({
                    data: {
                        type: "FOLLOW",
                        userId: targetUserId,
                        creatorId: userId,
                    },
                }),
            ]);
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.log("Error in toggleFollow", error);
        return { success: false };
    }
}

export async function getRandomUsers() {
    try {
        const userId = await getDbUserId();
        if (!userId) {
            return { success: false, error: "User not found" };
        }

        const randomUsers = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        id: {
                            not: userId,
                        },
                    },
                    {
                        NOT: {
                            followers: {
                                some: {
                                    followerId: userId,
                                },
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        followers: true,
                    },
                },
            },
            take: 3,
        });

        return randomUsers;
    } catch (error) {
        console.error("Error fetching random users:", error);
        return { success: false, error };
    }
}
