"use client";

import { getNotifications } from "@/actions/notification.action";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon, BellIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type N = Awaited<ReturnType<typeof getNotifications>>[number];

const ICONS: Record<string, React.ReactNode> = {
  LIKE: <HeartIcon className="size-3.5 text-red-500 fill-red-500" />,
  COMMENT: <MessageCircleIcon className="size-3.5 text-blue-500" />,
  FOLLOW: <UserPlusIcon className="size-3.5 text-green-500" />,
};
const MSGS: Record<string, string> = {
  LIKE: "liked your post",
  COMMENT: "replied to your post",
  FOLLOW: "followed you",
};

export default function NotificationsClient({ notifications }: { notifications: N[] }) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-14 z-10 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <BellIcon className="size-5 text-primary" />
          <h1 className="font-bold text-lg">Notifications</h1>
        </div>
        {notifications.some((n) => !n.read) && (
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
            {notifications.filter((n) => !n.read).length} new
          </span>
        )}
      </motion.div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
          >
            <BellIcon className="size-9 text-primary" />
          </motion.div>
          <h3 className="font-bold text-xl mb-2">All caught up!</h3>
          <p className="text-muted-foreground text-sm max-w-xs">When someone likes or replies to you, it&apos;ll appear here.</p>
        </div>
      ) : (
        <div>
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
              className={cn(
                "flex gap-3 px-4 py-3.5 border-b border-border/60 hover:bg-muted/30 transition-colors cursor-default",
                !n.read && "bg-primary/[0.04]"
              )}
            >
              {/* Avatar + icon badge */}
              <div className="relative shrink-0">
                <Link href={`/profile/${n.creator.username}`}>
                  <div className="avatar-ring">
                    <Avatar className="size-10">
                      <AvatarImage src={n.creator.image ?? "/avatar.png"} />
                      <AvatarFallback>{n.creator.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </Link>
                <span className="absolute -bottom-1 -right-1 bg-card rounded-full p-1 shadow border border-border/60">
                  {ICONS[n.type]}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-relaxed">
                    <Link href={`/profile/${n.creator.username}`}
                      className="font-bold hover:text-primary transition-colors">
                      {n.creator.name ?? n.creator.username}
                    </Link>{" "}
                    <span className="text-muted-foreground">{MSGS[n.type]}</span>
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                </div>

                {n.post && (n.type === "LIKE" || n.type === "COMMENT") && (
                  <div className="mt-2 text-sm text-muted-foreground bg-muted/40 rounded-xl px-3 py-2 line-clamp-2 border border-border/40">
                    {n.post.content}
                    {n.post.image && (
                      <img src={n.post.image} alt="" className="mt-1 rounded-lg w-14 h-14 object-cover" />
                    )}
                  </div>
                )}
                {n.type === "COMMENT" && n.comment && (
                  <div className="mt-1.5 text-sm bg-primary/5 rounded-xl px-3 py-2 border border-primary/10">
                    {n.comment.content}
                  </div>
                )}
                {!n.read && (
                  <span className="inline-block mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
