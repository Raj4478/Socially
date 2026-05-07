"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { ImageIcon, XIcon, Loader2Icon, GlobeIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import ImageUpload from "./imageUpload";
import { cn } from "@/lib/utils";

const MAX = 280;

export default function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const left = MAX - content.length;
  const isOver = left < 0;
  const isNear = left <= 20 && !isOver;
  const progress = Math.min(content.length / MAX, 1);
  const r = 10;
  const circ = 2 * Math.PI * r;
  const dash = circ * progress;

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !imageUrl) || isOver) return;
    setIsPosting(true);
    try {
      const res = await createPost(content, imageUrl);
      if (res?.success) {
        setContent(""); setImageUrl(""); setShowImage(false); setFocused(false);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        toast.success("Posted! ✨");
      }
    } catch { toast.error("Failed to post"); }
    finally { setIsPosting(false); }
  };

  if (!user) return null;

  return (
    <motion.div
      layout
      className={cn(
        "border-b border-border/60 px-4 py-4 transition-all",
        focused && "bg-primary/[0.02]"
      )}
    >
      <div className="flex gap-3">
        <div className="shrink-0 mt-0.5">
          <div className="avatar-ring">
            <Avatar className="size-10">
              <AvatarImage src={user.imageUrl || "/avatar.png"} />
              <AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {/* Audience badge */}
          <AnimatePresence>
            {focused && (
              <motion.button
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-1 text-xs font-semibold text-primary mb-2 hover:bg-primary/10 px-2 py-0.5 rounded-full transition-colors"
              >
                <GlobeIcon className="size-3" />
                Everyone
              </motion.button>
            )}
          </AnimatePresence>

          <textarea
            ref={textareaRef}
            placeholder="What's happening?!"
            value={content}
            onChange={(e) => { setContent(e.target.value); autoResize(); }}
            onFocus={() => setFocused(true)}
            disabled={isPosting}
            rows={1}
            className="w-full bg-transparent text-[17px] placeholder:text-muted-foreground/60 resize-none outline-none leading-relaxed min-h-[28px] overflow-hidden"
          />

          {/* Image upload */}
          <AnimatePresence>
            {showImage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-3 rounded-2xl overflow-hidden border border-border/60"
              >
                <ImageUpload
                  endpoint="postImage"
                  value={imageUrl}
                  onChange={(url) => { setImageUrl(url); if (!url) setShowImage(false); }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <AnimatePresence>
            {focused && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                className="h-px bg-border/60 my-3 origin-left"
              />
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 -ml-1.5">
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: "oklch(0.67 0.22 264 / 0.1)" }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setShowImage((p) => !p); setFocused(true); }}
                disabled={isPosting}
                className="p-2 rounded-full text-primary transition-colors"
              >
                {showImage && imageUrl
                  ? <XIcon className="size-5" />
                  : <ImageIcon className="size-5" />}
              </motion.button>
            </div>

            <div className="flex items-center gap-3">
              {/* Char ring */}
              <AnimatePresence>
                {content.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="relative size-6 flex items-center justify-center"
                  >
                    <svg className="size-6 -rotate-90" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r={r} fill="none"
                        stroke="currentColor" strokeWidth="2.5"
                        className="text-muted/30" />
                      <motion.circle cx="12" cy="12" r={r} fill="none"
                        stroke={isOver ? "oklch(0.577 0.245 27.325)" : isNear ? "oklch(0.75 0.18 70)" : "oklch(0.67 0.22 264)"}
                        strokeWidth="2.5"
                        strokeDasharray={`${dash} ${circ}`}
                        strokeLinecap="round"
                        animate={{ strokeDasharray: `${dash} ${circ}` }}
                        transition={{ duration: 0.1 }}
                      />
                    </svg>
                    <AnimatePresence>
                      {isNear && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "absolute text-[8px] font-bold",
                            isOver ? "char-ring-danger" : "char-ring-warn"
                          )}
                        >{left}</motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Post button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={(!content.trim() && !imageUrl) || isPosting || isOver}
                className={cn(
                  "px-5 py-2 rounded-full font-bold text-sm transition-all",
                  (!content.trim() && !imageUrl) || isOver
                    ? "bg-primary/40 text-primary-foreground/50 cursor-not-allowed"
                    : "bg-primary text-primary-foreground glow-sm hover:glow-primary"
                )}
              >
                {isPosting
                  ? <Loader2Icon className="size-4 animate-spin" />
                  : "Post"
                }
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
