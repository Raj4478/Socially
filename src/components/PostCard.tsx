"use client";

import { createComment, deletePost, getPosts, toggleLike, toggleBookmark } from "@/actions/post.action";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { DeleteAlertDialog } from "./DeleteAlertDialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { HeartIcon, MessageCircleIcon, SendIcon, BookmarkIcon, LogInIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

type Posts = Awaited<ReturnType<typeof getPosts>>;
type Post = Posts[number];

function PostCard({ post, dbUserId }: { post: Post; dbUserId: string | null }) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(
    post.likes.some((l: any) => l.userId === dbUserId)
  );
  const [hasBookmarked, setHasBookmarked] = useState(
    (post as any).bookmarks?.some((b: any) => b.userId === dbUserId) ?? false
  );
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const { ref: inViewRef, inView } = useInView({ threshold: 0.05, triggerOnce: true });

  const spawnParticles = () => {
    const ps = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 60,
      y: -(Math.random() * 40 + 20),
    }));
    setParticles(ps);
    setTimeout(() => setParticles([]), 700);
  };

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      const newVal = !hasLiked;
      setHasLiked(newVal);
      setLikeCount((p: number) => p + (hasLiked ? -1 : 1));
      if (newVal) { setLikeAnim(true); spawnParticles(); setTimeout(() => setLikeAnim(false), 400); }
      await toggleLike(post.id);
    } catch {
      setLikeCount(post._count.likes);
      setHasLiked(post.likes.some((l: any) => l.userId === dbUserId));
    } finally { setIsLiking(false); }
  };

  const handleBookmark = async () => {
    if (isBookmarking) return;
    try {
      setIsBookmarking(true);
      setHasBookmarked((p: boolean) => !p);
      const res = await toggleBookmark(post.id);
      if (res?.success) toast.success(res.bookmarked ? "Saved!" : "Removed", { duration: 1500 });
    } catch {
      setHasBookmarked((post as any).bookmarks?.some((b: any) => b.userId === dbUserId) ?? false);
    } finally { setIsBookmarking(false); }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    try {
      setIsCommenting(true);
      await createComment(post.id, newComment);
      toast.success("Replied!");
      setNewComment("");
    } catch { toast.error("Failed"); }
    finally { setIsCommenting(false); }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await deletePost(post.id);
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setIsDeleting(false); }
  };

  return (
    <motion.article
      ref={inViewRef}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="post-item border-b border-border/60 px-4 py-4"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          <Link href={`/profile/${post.author.username}`}>
            <motion.div whileHover={{ scale: 1.05 }} className="avatar-ring">
              <Avatar className="size-9">
                <AvatarImage src={post.author.image ?? "/avatar.png"} />
                <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                  {post.author.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </Link>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex flex-wrap items-center gap-x-1.5 text-sm min-w-0">
              <Link
                href={`/profile/${post.author.username}`}
                className="font-bold hover:text-primary transition-colors truncate max-w-[130px]"
              >
                {post.author.name}
              </Link>
              <Link
                href={`/profile/${post.author.username}`}
                className="text-muted-foreground truncate text-xs"
              >
                @{post.author.username}
              </Link>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: false })}
              </span>
            </div>
            {dbUserId === post.author.id && (
              <DeleteAlertDialog isDeleting={isDeleting} onDelete={handleDelete} />
            )}
          </div>

          {/* Text */}
          {post.content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mb-2">
              {post.content}
            </p>
          )}

          {/* Image */}
          {post.image && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="mt-2 mb-3 rounded-2xl overflow-hidden border border-border/60 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image}
                alt="Post image"
                className="w-full h-auto max-h-[500px] object-cover group-hover:scale-[1.01] transition-transform duration-500"
              />
            </motion.div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-1 -ml-2 mt-1">
            {/* Comment */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowComments((p: boolean) => !p)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-all",
                showComments
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              )}
            >
              <MessageCircleIcon className="size-4" />
              <span>{post.comments.length}</span>
            </motion.button>

            {/* Like */}
            {user ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={handleLike}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-all",
                    hasLiked
                      ? "text-red-500 bg-red-500/10"
                      : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                  )}
                >
                  <HeartIcon
                    className={cn(
                      "size-4 transition-all",
                      hasLiked && "fill-red-500",
                      likeAnim && "like-burst"
                    )}
                  />
                  <motion.span
                    key={likeCount}
                    initial={{ y: hasLiked ? -8 : 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {likeCount}
                  </motion.span>
                </motion.button>
                {/* Particle burst */}
                <AnimatePresence>
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                      animate={{ opacity: 0, scale: 0, x: p.x, y: p.y }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-red-500 pointer-events-none"
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all">
                  <HeartIcon className="size-4" />
                  <span>{likeCount}</span>
                </button>
              </SignInButton>
            )}

            {/* Bookmark — pushed to right */}
            <div className="ml-auto">
              {user ? (
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleBookmark}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-all",
                    hasBookmarked
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                >
                  <motion.div
                    animate={hasBookmarked ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <BookmarkIcon className={cn("size-4", hasBookmarked && "fill-primary")} />
                  </motion.div>
                </motion.button>
              ) : (
                <SignInButton mode="modal">
                  <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                    <BookmarkIcon className="size-4" />
                  </button>
                </SignInButton>
              )}
            </div>
          </div>

          {/* Comments */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-border/60 space-y-3">
                  {/* Existing comments */}
                  {post.comments.map((c: any, i: number) => (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex gap-2.5"
                    >
                      <Avatar className="size-7 shrink-0">
                        <AvatarImage src={c.author.image ?? "/avatar.png"} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {c.author.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 bg-muted/50 rounded-2xl px-3 py-2">
                        <div className="flex flex-wrap items-center gap-x-1.5 text-xs mb-0.5">
                          <span className="font-semibold">{c.author.name}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm break-words">{c.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Reply input */}
                  {user ? (
                    <div className="flex gap-2.5">
                      <Avatar className="size-7 shrink-0">
                        <AvatarImage src={user.imageUrl || "/avatar.png"} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {user.firstName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex gap-2">
                        <Textarea
                          placeholder="Post your reply…"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[52px] resize-none rounded-2xl text-sm bg-muted/50 border-border/60 focus:border-primary/50"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment();
                            }
                          }}
                        />
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || isCommenting}
                          className="self-end p-2.5 rounded-full bg-primary text-primary-foreground disabled:opacity-40 glow-sm transition-all"
                        >
                          <SendIcon className="size-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <SignInButton mode="modal">
                      <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-2xl cursor-pointer hover:bg-muted/60 transition-colors">
                        <LogInIcon className="size-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Sign in to reply</span>
                      </div>
                    </SignInButton>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}

export default PostCard;
