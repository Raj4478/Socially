"use client";

import { useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { ImageIcon, Loader2Icon, XIcon } from "lucide-react";
import { createPost } from "@/actions/post.action";
import { useUploadThing } from "@/lib/uploadthing";
import { POST_MAX } from "@/lib/validation";
import type { PostDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import UserAvatar from "./UserAvatar";
import { cn } from "@/lib/utils";

function CharacterRing({ count }: { count: number }) {
  const left = POST_MAX - count;
  const r = 9;
  const circumference = 2 * Math.PI * r;
  const progress = Math.min(count / POST_MAX, 1);
  const color = left < 0 ? "text-destructive" : left <= 20 ? "text-amber-500" : "text-primary";
  return (
    <div className="flex items-center gap-1.5" aria-live="polite">
      {left <= 20 && <span className={cn("text-xs tabular-nums", color)}>{left}</span>}
      <svg className="size-6 -rotate-90" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r={r} fill="none" strokeWidth="2" className="stroke-border" />
        <circle
          cx="12" cy="12" r={r} fill="none" strokeWidth="2" strokeLinecap="round"
          className={cn("stroke-current transition-all", color)}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
    </div>
  );
}

export default function Composer({
  onPosted,
  autoFocus = false,
  placeholder = "What's happening?",
  className,
}: {
  onPosted?: (post: PostDTO) => void;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [posting, setPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("postImage", {
    onClientUploadComplete: (res) => setImage(res[0]?.ufsUrl ?? ""),
    onUploadError: (error) => {
      toast.error(error.message || "Upload failed");
    },
  });

  if (!user) return null;

  const tooLong = content.length > POST_MAX;
  const canPost = (content.trim().length > 0 || !!image) && !tooLong && !posting && !isUploading;

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const submit = async () => {
    if (!canPost) return;
    setPosting(true);
    const res = await createPost({ content, image });
    setPosting(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    setContent("");
    setImage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    toast.success("Posted");
    onPosted?.(res.data);
  };

  return (
    <div className={cn("flex gap-3 border-b px-4 py-3", className)}>
      <UserAvatar user={{ name: user.fullName, username: user.username ?? "", image: user.imageUrl }} />
      <div className="min-w-0 flex-1">
        <label htmlFor="composer" className="sr-only">New post</label>
        <textarea
          id="composer"
          ref={textareaRef}
          value={content}
          autoFocus={autoFocus}
          onChange={(e) => {
            setContent(e.target.value);
            resize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none bg-transparent py-2 text-[17px] leading-relaxed outline-none placeholder:text-muted-foreground"
        />

        {image && (
          <div className="relative mt-2 w-fit">
            <img src={image} alt="Attached" className="max-h-80 rounded-xl border object-cover" />
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-2 size-8 rounded-full bg-black/60 text-white hover:bg-black/80"
              onClick={() => setImage("")}
              aria-label="Remove image"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        )}

        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <div className="flex items-center">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) startUpload([file]);
                e.target.value = "";
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading || !!image}
              aria-label="Add photo"
            >
              {isUploading ? <Loader2Icon className="size-[18px] animate-spin" /> : <ImageIcon className="size-[18px]" />}
            </Button>
            <span className="ml-1 hidden text-xs text-muted-foreground sm:inline">Use #tags and @mentions</span>
          </div>
          <div className="flex items-center gap-3">
            {content.length > 0 && <CharacterRing count={content.length} />}
            <Button onClick={submit} disabled={!canPost} className="rounded-full px-5 font-semibold">
              {posting && <Loader2Icon className="animate-spin" />}
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
