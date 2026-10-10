"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";
import toast from "react-hot-toast";
import {
  BookmarkIcon, HeartIcon, LinkIcon, Loader2Icon, MessageCircleIcon, MoreHorizontalIcon, PencilIcon, ShareIcon, Trash2Icon,
} from "lucide-react";
import { deletePost, toggleBookmark, toggleLike, updatePost } from "@/actions/post.action";
import type { PostDTO } from "@/lib/types";
import { POST_MAX } from "@/lib/validation";
import { cn, compactNumber, displayName, shortTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UserAvatar from "./UserAvatar";
import RichText from "./RichText";
import CommentsSection from "./CommentsSection";

function ActionButton({
  label, count, active, activeClass, hoverClass, onClick, children,
}: {
  label: string;
  count?: number;
  active?: boolean;
  activeClass?: string;
  hoverClass: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      aria-pressed={active}
      className={cn("-ml-2 flex items-center gap-1 rounded-full p-2 text-sm text-muted-foreground transition-colors", hoverClass, active && activeClass)}
    >
      {children}
      {count !== undefined && <span className="min-w-4 tabular-nums">{count > 0 ? compactNumber(count) : ""}</span>}
    </button>
  );
}

export default function PostCard({
  post: initial,
  viewerId,
  defaultShowComments = false,
  linkToPost = true,
  onDeleted,
}: {
  post: PostDTO;
  viewerId: string | null;
  defaultShowComments?: boolean;
  linkToPost?: boolean;
  onDeleted?: (id: string) => void;
}) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [post, setPost] = useState(initial);
  const [showComments, setShowComments] = useState(defaultShowComments);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial.content ?? "");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [pop, setPop] = useState(false);

  const isMine = viewerId === post.author.id;
  const postUrl = () => `${window.location.origin}/post/${post.id}`;

  const requireAuth = () => {
    if (isSignedIn) return true;
    openSignIn();
    return false;
  };

  const like = async () => {
    if (!requireAuth()) return;
    const prev = post;
    const liked = !post.likedByMe;
    if (liked) {
      setPop(true);
      setTimeout(() => setPop(false), 300);
    }
    setPost((p) => ({ ...p, likedByMe: liked, likeCount: p.likeCount + (liked ? 1 : -1) }));
    const res = await toggleLike(post.id);
    if (!res.success) {
      setPost(prev);
      toast.error(res.error);
    } else {
      setPost((p) => ({ ...p, likedByMe: res.data.liked, likeCount: res.data.likeCount }));
    }
  };

  const bookmark = async () => {
    if (!requireAuth()) return;
    const was = post.bookmarkedByMe;
    setPost((p) => ({ ...p, bookmarkedByMe: !was }));
    const res = await toggleBookmark(post.id);
    if (!res.success) {
      setPost((p) => ({ ...p, bookmarkedByMe: was }));
      toast.error(res.error);
    } else {
      toast.success(res.data.bookmarked ? "Added to bookmarks" : "Removed from bookmarks");
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl());
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${displayName(post.author)} on Socially`, url: postUrl() });
      } catch {
        /* share sheet dismissed */
      }
    } else {
      await copyLink();
    }
  };

  const saveEdit = async () => {
    setSaving(true);
    const res = await updatePost(post.id, draft);
    setSaving(false);
    if (!res.success) return void toast.error(res.error);
    setPost(res.data);
    setEditing(false);
    toast.success("Post updated");
  };

  const remove = async () => {
    const res = await deletePost(post.id);
    setConfirmDelete(false);
    if (!res.success) return void toast.error(res.error);
    setDeleted(true);
    toast.success("Post deleted");
    onDeleted?.(post.id);
  };

  if (deleted) return null;

  return (
    <article
      className={cn("border-b px-4 py-3 transition-colors", linkToPost && "cursor-pointer hover:bg-accent/40")}
      onClick={(e) => {
        if (!linkToPost || editing || window.getSelection()?.toString()) return;
        if ((e.target as HTMLElement).closest("a,button,input,textarea,img,[role=menu],[role=alertdialog]")) return;
        router.push(`/post/${post.id}`);
      }}
    >
      <div className="flex gap-3">
        <Link href={`/profile/${post.author.username}`} className="shrink-0">
          <UserAvatar user={post.author} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[15px]">
            <Link href={`/profile/${post.author.username}`} className="truncate font-semibold hover:underline">
              {displayName(post.author)}
            </Link>
            <span className="truncate text-muted-foreground">@{post.author.username}</span>
            <span className="text-muted-foreground" aria-hidden>·</span>
            <Link href={`/post/${post.id}`} className="shrink-0 text-muted-foreground hover:underline">
              <time dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()} suppressHydrationWarning>
                {shortTimeAgo(post.createdAt)}
              </time>
            </Link>
            {post.edited && <span className="shrink-0 text-xs text-muted-foreground">· edited</span>}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="-mr-2 ml-auto size-8 shrink-0 rounded-full text-muted-foreground" aria-label="Post options">
                  <MoreHorizontalIcon className="size-[18px]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={copyLink}>
                  <LinkIcon /> Copy link
                </DropdownMenuItem>
                {isMine && (
                  <>
                    <DropdownMenuItem
                      onSelect={() => {
                        setDraft(post.content ?? "");
                        setEditing(true);
                      }}
                    >
                      <PencilIcon /> Edit post
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setConfirmDelete(true)}>
                      <Trash2Icon /> Delete post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {editing ? (
            <div className="mt-1 space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                autoFocus
                aria-label="Edit post"
                className="w-full resize-none rounded-lg border bg-transparent p-2.5 text-[15px] outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex items-center justify-end gap-2">
                <span className={cn("mr-auto text-xs tabular-nums", draft.length > POST_MAX ? "text-destructive" : "text-muted-foreground")}>
                  {draft.length}/{POST_MAX}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                <Button size="sm" className="rounded-full px-4" disabled={saving || draft.length > POST_MAX} onClick={saveEdit}>
                  {saving && <Loader2Icon className="animate-spin" />} Save
                </Button>
              </div>
            </div>
          ) : (
            post.content && <RichText text={post.content} className="mt-0.5 whitespace-pre-wrap break-words text-[15px] leading-relaxed" />
          )}

          {post.image && (
            <a href={post.image} target="_blank" rel="noopener noreferrer" className="mt-3 block overflow-hidden rounded-2xl border">
              <img src={post.image} alt="" loading="lazy" className="max-h-[32rem] w-full object-cover" />
            </a>
          )}

          <div className="mt-1.5 flex max-w-md items-center justify-between">
            <ActionButton
              label={`Replies: ${post.commentCount}`}
              count={post.commentCount}
              active={showComments}
              activeClass="text-primary"
              hoverClass="hover:bg-primary/10 hover:text-primary"
              onClick={() => setShowComments((s) => !s)}
            >
              <MessageCircleIcon className="size-[18px]" />
            </ActionButton>
            <ActionButton
              label={`${post.likedByMe ? "Unlike" : "Like"}: ${post.likeCount} likes`}
              count={post.likeCount}
              active={post.likedByMe}
              activeClass="text-like"
              hoverClass="hover:bg-like/10 hover:text-like"
              onClick={like}
            >
              <HeartIcon className={cn("size-[18px]", post.likedByMe && "fill-current", pop && "animate-pop")} />
            </ActionButton>
            <ActionButton
              label={post.bookmarkedByMe ? "Remove bookmark" : "Bookmark"}
              active={post.bookmarkedByMe}
              activeClass="text-primary"
              hoverClass="hover:bg-primary/10 hover:text-primary"
              onClick={bookmark}
            >
              <BookmarkIcon className={cn("size-[18px]", post.bookmarkedByMe && "fill-current")} />
            </ActionButton>
            <ActionButton label="Share" hoverClass="hover:bg-primary/10 hover:text-primary" onClick={share}>
              <ShareIcon className="size-[18px]" />
            </ActionButton>
          </div>

          {showComments && (
            <CommentsSection
              postId={post.id}
              onCountChange={(delta) => setPost((p) => ({ ...p, commentCount: Math.max(0, p.commentCount + delta) }))}
            />
          )}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. The post and its replies and likes will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-destructive text-white hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
