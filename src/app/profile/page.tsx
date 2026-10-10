import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** /profile → the signed-in user's own profile. */
export default async function MyProfile() {
  const viewer = await getViewer();
  redirect(viewer ? `/profile/${viewer.username}` : "/");
}
