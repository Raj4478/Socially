import type { Metadata } from "next";
import { getNotifications } from "@/actions/notification.action";
import PageHeader from "@/components/PageHeader";
import NotificationList from "@/components/NotificationList";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const initial = await getNotifications();
  return (
    <>
      <PageHeader title="Notifications" />
      <NotificationList initial={initial} />
    </>
  );
}
