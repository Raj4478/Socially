"use client";

import { createComment, deletePost, getPosts, toggleLike, toggleBookmark } from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  HeartIcon, MessageCircleIcon, SendIcon,
  BookmarkIcon, LogInIcon, MoreHorizontalIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

function PostCard({ post, dbUserId }: { post: Post; dbUserId: string | null }) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(post.likes.some((l) => l.userId === dbUserId));
  const [hasBookmarked, setHasBookmarked] = useState(post.bookmarks?.some((b) => b.userId === dbUserId) ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      setHasLiked((p) => !p);
      setLikeCount((p) => p + (hasLiked ? -1 : 1));
      if (!hasLiked) { setLikeAnimating(true); setTimeout(() => setLikeAnimating(false), 300); }
      await toggleLike(post.id);
    } catch {
      setLikeCount(post._count.likes);
      setHasLiked(post.likes.some((l) => l.userId === dbUserId));
    } finally { setIsLiking(false); }
  };

  const handleBookmark = async () => {
    if (isBookmarking) return;
    try {
      setIsBookmarking(true);
      setHasBookmarked((p) => !p);
      const res = await toggleBookmark(post.id);
      if (res?.success) toast.success(res.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch {
      setHasBookmarked(post.bookmarks?.some((b) => b.userId === dbUserId) ?? false);
      toast.error("Failed to update bookmark");
    } finally { setIsBookmarking(false); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      const res = await createComment(post.id, newComment);
      if (res?.success) { toast.success("Comment posted"); setNewComment(""); }
    } catch { toast.error("Failed to post comment"); }
    finally { setIsCommenting(false); }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await deletePost(post.id);
      if (res.success) toast.success("Post deleted");
      else throw new Error(res.error);
    } catch { toast.error("Failed to delete post"); }
    finally { setIsDeleting(false); }
  };

  const isAuthor = dbUserId === post.author.id;

  return (
    <article className="post-card border-b border-border px-4 py-4 cursor-pointer group">
      <div className="flex gap-3">
        {/* Avatar column */}
        <div className="shrink-0">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar className="size-10 hover:opacity-90 transition-opacity">
              <AvatarImage src={post.author.image ?? "/avatar.png"} />
              <AvatarFallback>{post.author.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </Link>
        </div>

        {/* Content column */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 min-w-0">
              <Link href={`/profile/${post.author.username}`}
                className="font-bold text-sm hover:underline truncate max-w-[140px]">
                {post.author.name}
              </Link>
              <Link href={`/profile/${post.author.username}`}
                className="text-muted-foreground text-sm truncate">
                @{post.author.username}
              </Link>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm whitespace-nowrap">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: false })}
              </span>
            </div>
            {isAuthor && (
              <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDelete} />
            )}
          </div>

          {/* Post content */}
          {post.content && (
            <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
          )}

          {/* Post image */}
          {post.image && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-border">
              <img src={post.image} alt="Post" className="w-full h-auto max-h-[512px] object-cover" />
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center justify-between mt-3 -ml-2 max-w-xs">
            {/* Comment */}
            <button
              onClick={() => setShowComments((p) => !p)}
              className="group/btn flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
            >
              <MessageCircleIcon className={cn("size-4.5", showComments && "fill-primary/20 text-primary")} />
              <span className="text-xs">{post.comments.length}</span>
            </button>

            {/* Like */}
            {user ? (
              <button
                onClick={handleLike}
                className="group/btn flex items-center gap-1.5 text-muted-foreground hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10"
              >
                <HeartIcon className={cn(
                  "size-4.5 transition-all",
                  hasLiked && "fill-red-500 text-red-500",
                  likeAnimating && "like-pop"
                )} />
                <span className={cn("text-xs", hasLiked && "text-red-500")}>{likeCount}</span>
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors">
                  <HeartIcon className="size-4.5" />
                  <span className="text-xs">{likeCount}</span>
                </button>
              </SignInButton>
            )}

            {/* Bookmark */}
            {user ? (
              <button
                onClick={handleBookmark}
                className="group/btn flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-primary/10"
              >
                <BookmarkIcon className={cn("size-4.5", hasBookmarked && "fill-primary text-primary")} />
              </button>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 text-muted-foreground p-2 rounded-full hover:bg-primary/10 transition-colors">
                  <BookmarkIcon className="size-4.5" />
                </button>
              </SignInButton>
            )}
          </div>

          {/* Comments section */}
          {showComments && (
            <div className="mt-3 space-y-3 border-t border-border pt-3">
              {post.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={c.author.image ?? "/avatar.png"} />
                    <AvatarFallback>{c.author.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 bg-muted/50 rounded-2xl px-3 py-2">
                    <div className="flex flex-wrap items-center gap-x-1.5 text-xs mb-0.5">
                      <span className="font-semibold">{c.author.name}</span>
                      <span className="text-muted-foreground">@{c.author.username}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm break-words">{c.content}</p>
                  </div>
                </div>
              ))}

              {user ? (
                <div className="flex gap-2.5">
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={user.imageUrl || "/avatar.png"} />
                    <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      placeholder="Post your reply…"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[60px] resize-none rounded-2xl text-sm"
                    />
                    <Button size="sm" onClick={handleAddComment}
                      disabled={!newComment.trim() || isCommenting}
                      className="self-end rounded-full px-4">
                      {isCommenting ? "…" : <SendIcon className="size-3.5" />}
                    </Button>
                  </div>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-2xl cursor-pointer hover:bg-muted transition-colors">
                    <LogInIcon className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Sign in to reply</span>
                  </div>
                </SignInButton>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default PostCard;
