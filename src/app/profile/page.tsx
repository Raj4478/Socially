export const dynamic = "force-dynamic";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId, syncUser } from "@/actions/users.action";

export default async function ProfileRedirectPage() {
  const authUser = await currentUser();

  if (!authUser) redirect("/");

  // Ensure user is synced to DB
  await syncUser().catch(() => null);

  const user = await getUserByClerkId(authUser.id);

  if (!user?.username) redirect("/");

  redirect(`/profile/${user.username}`);
}
