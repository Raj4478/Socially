import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import prisma from "./prisma";
import { ActionError } from "./action";
import { toHandle } from "./handle";

/** Creates the database row for a Clerk user the first time we see them. */
async function createFromClerk(clerkId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const base = toHandle(clerkUser.username ?? email.split("@")[0] ?? `user_${clerkId.slice(-8)}`);
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() || base;

  // Retry with a numeric suffix if the handle is taken (also covers two tabs racing).
  for (let attempt = 0; attempt < 20; attempt++) {
    const username = attempt === 0 ? base : `${base.slice(0, 16)}${attempt}`;
    try {
      return await prisma.user.create({
        data: { clerkId, email, name, username, image: clerkUser.imageUrl ?? "" },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const target = String(error.meta?.target ?? "");
        // Another request already created this Clerk user.
        if (target.includes("clerkId") || target.includes("email")) {
          return prisma.user.findUnique({ where: { clerkId } });
        }
        continue;
      }
      throw error;
    }
  }
  throw new Error("Could not allocate a username");
}

/**
 * The signed-in user's database record, created on first visit.
 * Cached per request, so calling it from several components costs one query.
 */
export const getViewer = cache(async () => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  return existing ?? createFromClerk(clerkId);
});

export async function getViewerId(): Promise<string | null> {
  try {
    return (await getViewer())?.id ?? null;
  } catch (error) {
    console.error("[auth:getViewerId]", error);
    return null;
  }
}

export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) throw new ActionError("Please sign in to continue");
  return viewer;
}
