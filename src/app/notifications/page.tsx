export const dynamic = "force-dynamic";

import { getNotifications, markNotificationsAsRead } from "@/actions/notification.action";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NotificationsClient from "@/components/NotificationsClient";

export default async function NotificationsPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const notifications = await getNotifications();
  const unreadIds = notifications
    .filter((n) => !n.read)
    .map((n) => n.id);

  if (unreadIds.length > 0) {
    await markNotificationsAsRead(unreadIds).catch(() => null);
  }

  return <NotificationsClient notifications={notifications as any} />;
}
