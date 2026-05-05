"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { ImageIcon, XIcon, Loader2Icon, SmileIcon } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";
import ImageUpload from "./imageUpload";
import { cn } from "@/lib/utils";

const MAX_CHARS = 280;

function CreatePost() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = content.length;
  const charsLeft = MAX_CHARS - charCount;
  const isOverLimit = charsLeft < 0;
  const isNearLimit = charsLeft <= 20 && charsLeft >= 0;

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !imageUrl) || isOverLimit) return;
    setIsPosting(true);
    try {
      const res = await createPost(content, imageUrl);
      if (res?.success) {
        setContent("");
        setImageUrl("");
        setShowImageUpload(false);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
        toast.success("Posted!");
      }
    } catch {
      toast.error("Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="border-b border-border px-4 py-4">
      <div className="flex gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={user.imageUrl || "/avatar.png"} />
          <AvatarFallback>{user.firstName?.[0] || "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            placeholder="What's happening?!"
            value={content}
            onChange={(e) => { setContent(e.target.value); autoResize(); }}
            disabled={isPosting}
            rows={1}
            className="w-full bg-transparent text-[17px] placeholder:text-muted-foreground resize-none outline-none leading-relaxed min-h-[28px] overflow-hidden"
          />

          {showImageUpload && (
            <div className="mt-3 rounded-2xl border border-border overflow-hidden relative">
              <ImageUpload
                endpoint="postImage"
                value={imageUrl}
                onChange={(url) => {
                  setImageUrl(url);
                  if (!url) setShowImageUpload(false);
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1 -ml-2">
              <Button type="button" variant="ghost" size="icon"
                className="rounded-full text-primary hover:bg-primary/10 size-9"
                onClick={() => setShowImageUpload((p) => !p)}
                disabled={isPosting}>
                {showImageUpload && imageUrl
                  ? <XIcon className="size-4" />
                  : <ImageIcon className="size-4" />}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {charCount > 0 && (
                <div className="relative size-6">
                  <svg className="size-6 -rotate-90" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor"
                      className="text-muted/40" strokeWidth="2.5" />
                    <circle cx="12" cy="12" r="10" fill="none"
                      stroke={isOverLimit ? "oklch(0.577 0.245 27.325)" : isNearLimit ? "oklch(0.75 0.18 70)" : "oklch(0.65 0.22 260)"}
                      strokeWidth="2.5"
                      strokeDasharray={`${Math.min(Math.PI * 20 * (charCount / MAX_CHARS), Math.PI * 20)} ${Math.PI * 20}`}
                      className="transition-all"
                    />
                  </svg>
                  {isNearLimit && (
                    <span className={cn(
                      "absolute inset-0 flex items-center justify-center text-[9px] font-bold",
                      isOverLimit ? "char-danger" : "char-warn"
                    )}>{charsLeft}</span>
                  )}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={(!content.trim() && !imageUrl) || isPosting || isOverLimit}
                className="rounded-full px-5 font-bold"
                size="sm"
              >
                {isPosting ? <Loader2Icon className="size-4 animate-spin" /> : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePost;
