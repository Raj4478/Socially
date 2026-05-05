"use client";

import { getNotifications } from "@/actions/notification.action";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon, BellIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type N = Awaited<ReturnType<typeof getNotifications>>[number];

const ICONS: Record<string, React.ReactNode> = {
  LIKE: <HeartIcon className="size-4 text-red-500 fill-red-500" />,
  COMMENT: <MessageCircleIcon className="size-4 text-blue-500 fill-blue-500/20" />,
  FOLLOW: <UserPlusIcon className="size-4 text-green-500" />,
};
const MESSAGES: Record<string, string> = {
  LIKE: "liked your post",
  COMMENT: "replied to your post",
  FOLLOW: "followed you",
};

export default function NotificationsClient({ notifications }: { notifications: N[] }) {
  return (
    <div>
      <div className="sticky top-14 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold text-xl flex items-center gap-2">
          <BellIcon className="size-5" /> Notifications
        </h1>
        {notifications.filter((n) => !n.read).length > 0 && (
          <span className="text-xs text-muted-foreground">
            {notifications.filter((n) => !n.read).length} new
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <BellIcon className="size-8 text-primary" />
          </div>
          <h3 className="font-bold text-xl mb-2">Nothing yet</h3>
          <p className="text-muted-foreground text-sm">When someone likes or replies to you, you'll see it here.</p>
        </div>
      ) : (
        notifications.map((n) => (
          <div key={n.id} className={cn(
            "flex gap-3 px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors",
            !n.read && "bg-primary/5"
          )}>
            <div className="relative shrink-0">
              <Link href={`/profile/${n.creator.username}`}>
                <Avatar className="size-11">
                  <AvatarImage src={n.creator.image ?? "/avatar.png"} />
                  <AvatarFallback>{n.creator.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Link>
              <span className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                {ICONS[n.type]}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/profile/${n.creator.username}`} className="font-bold hover:underline">
                    {n.creator.name ?? n.creator.username}
                  </Link>{" "}
                  <span className="text-muted-foreground">{MESSAGES[n.type]}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </span>
              </div>

              {n.post && (n.type === "LIKE" || n.type === "COMMENT") && (
                <div className="mt-2 text-sm text-muted-foreground bg-muted/50 rounded-xl px-3 py-2 line-clamp-2">
                  {n.post.content}
                  {n.post.image && (
                    <img src={n.post.image} alt="" className="mt-1 rounded-lg w-16 h-16 object-cover" />
                  )}
                </div>
              )}
              {n.type === "COMMENT" && n.comment && (
                <div className="mt-1.5 text-sm bg-muted/30 rounded-xl px-3 py-2">
                  {n.comment.content}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
