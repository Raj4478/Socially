"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellIcon, HeartIcon, Loader2Icon, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import { getNotifications, markAllNotificationsRead } from "@/actions/notification.action";
import type { NotificationDTO, Page } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn, displayName, shortTimeAgo } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import EmptyState from "./EmptyState";
import { excerpt } from "@/lib/content";

const META = {
  LIKE: { icon: HeartIcon, color: "text-like", text: "liked your post" },
  COMMENT: { icon: MessageCircleIcon, color: "text-primary", text: "replied to your post" },
  FOLLOW: { icon: UserPlusIcon, color: "text-success", text: "followed you" },
} as const;

function href(n: NotificationDTO) {
  return n.type === "FOLLOW" || !n.post ? `/profile/${n.creator.username}` : `/post/${n.post.id}`;
}

export default function NotificationList({ initial }: { initial: Page<NotificationDTO> }) {
  const router = useRouter();
  const [items, setItems] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  // Remember which ones were unread when the page opened, so they stay highlighted.
  const [unreadIds] = useState(() => new Set(initial.items.filter((n) => !n.read).map((n) => n.id)));

  useEffect(() => {
    if (unreadIds.size === 0) return;
    markAllNotificationsRead().then((res) => {
      if (res.success) router.refresh(); // clears the badge in the nav
    });
  }, [unreadIds, router]);

  const more = async () => {
    if (!cursor) return;
    setLoading(true);
    const page = await getNotifications(cursor);
    setItems((i) => [...i, ...page.items]);
    setCursor(page.nextCursor);
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={BellIcon}
        title="Nothing to see yet"
        description="When someone likes, replies to or follows you, you'll see it here."
      />
    );
  }

  return (
    <div>
      <ul>
        {items.map((n) => {
          const { icon: Icon, color, text } = META[n.type];
          return (
            <li key={n.id}>
              <Link
                href={href(n)}
                className={cn("flex gap-3 border-b px-4 py-3 transition-colors hover:bg-accent/40", unreadIds.has(n.id) && "bg-primary/[0.04]")}
              >
                <Icon className={cn("mt-1 size-6 shrink-0", color, n.type === "LIKE" && "fill-current")} />
                <div className="min-w-0 flex-1">
                  <UserAvatar user={n.creator} size="sm" />
                  <p className="mt-1.5 text-[15px]">
                    <span className="font-semibold">{displayName(n.creator)}</span> {text}
                    <span className="text-muted-foreground"> · {shortTimeAgo(n.createdAt)}</span>
                  </p>
                  {n.type === "COMMENT" && n.comment && <p className="mt-1 text-[15px]">{excerpt(n.comment.content, 140)}</p>}
                  {n.post && (n.post.content || n.post.image) && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {n.post.content ? excerpt(n.post.content, 140) : "Photo"}
                    </p>
                  )}
                </div>
                {unreadIds.has(n.id) && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="New" />}
              </Link>
            </li>
          );
        })}
      </ul>
      {cursor && (
        <div className="flex justify-center py-4">
          <Button variant="outline" size="sm" onClick={more} disabled={loading}>
            {loading && <Loader2Icon className="animate-spin" />} Load older
          </Button>
        </div>
      )}
    </div>
  );
}
