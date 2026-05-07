export const dynamic = "force-dynamic";

// @ts-nocheck
import { getNotifications, markNotificationsAsRead } from "@/actions/notification.action";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon, BellIcon } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import NotificationsClient from "@/components/NotificationsClient";

export default async function NotificationsPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const notifications = await getNotifications();
  const unreadIds = notifications.filter((n: any) => !n.read).map((n: any) => n.id);
  if (unreadIds.length > 0) await markNotificationsAsRead(unreadIds);

  return <NotificationsClient notifications={notifications} />;
}
