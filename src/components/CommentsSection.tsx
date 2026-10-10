"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { createComment, deleteComment, getComments } from "@/actions/post.action";
import { COMMENT_MAX } from "@/lib/validation";
import type { CommentDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "./UserAvatar";
import RichText from "./RichText";
import { displayName, shortTimeAgo } from "@/lib/utils";

export default function CommentsSection({
  postId,
  onCountChange,
}: {
  postId: string;
  onCountChange?: (delta: number) => void;
}) {
  const { isSignedIn } = useUser();
  const [comments, setComments] = useState<CommentDTO[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    getComments(postId).then((c) => active && setComments(c));
    return () => {
      active = false;
    };
  }, [postId]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    const res = await createComment(postId, draft);
    setSending(false);
    if (!res.success) return void toast.error(res.error);
    setComments((c) => [...(c ?? []), res.data]);
    setDraft("");
    onCountChange?.(1);
  };

  const remove = async (comment: CommentDTO) => {
    setComments((c) => c?.filter((x) => x.id !== comment.id) ?? null);
    onCountChange?.(-1);
    const res = await deleteComment(comment.id);
    if (!res.success) {
      toast.error(res.error);
      setComments((c) => (c ? [...c, comment].sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : c));
      onCountChange?.(1);
    }
  };

  return (
    <div className="mt-3 space-y-3 border-t pt-3" onClick={(e) => e.stopPropagation()}>
      {comments === null ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-2.5">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No replies yet. Start the conversation.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="group flex gap-2.5">
              <Link href={`/profile/${c.author.username}`} className="shrink-0">
                <UserAvatar user={c.author} size="sm" />
              </Link>
              <div className="min-w-0 flex-1 rounded-xl bg-secondary/60 px-3 py-2">
                <div className="flex items-center gap-1.5 text-sm">
                  <Link href={`/profile/${c.author.username}`} className="truncate font-semibold hover:underline">
                    {displayName(c.author)}
                  </Link>
                  <span className="truncate text-muted-foreground">@{c.author.username}</span>
                  <span className="text-muted-foreground">·</span>
                  <time className="shrink-0 text-muted-foreground" dateTime={c.createdAt}>{shortTimeAgo(c.createdAt)}</time>
                  {c.canDelete && (
                    <button
                      onClick={() => remove(c)}
                      className="ml-auto rounded p-1 text-muted-foreground opacity-0 transition hover:text-destructive focus:opacity-100 group-hover:opacity-100"
                      aria-label="Delete reply"
                    >
                      <Trash2Icon className="size-3.5" />
                    </button>
                  )}
                </div>
                <RichText text={c.content} className="mt-0.5 whitespace-pre-wrap break-words text-sm" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {isSignedIn ? (
        <form onSubmit={send} className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={COMMENT_MAX}
            placeholder="Post your reply"
            aria-label="Reply"
            className="h-9 flex-1 rounded-full border bg-transparent px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" size="sm" className="rounded-full px-4" disabled={!draft.trim() || sending}>
            {sending ? <Loader2Icon className="animate-spin" /> : "Reply"}
          </Button>
        </form>
      ) : (
        <SignInButton mode="modal">
          <Button variant="outline" size="sm" className="rounded-full">Sign in to reply</Button>
        </SignInButton>
      )}
    </div>
  );
}
