"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeatherIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Composer from "@/components/Composer";

/** The "Post" button in the sidebar: opens the composer from any page. */
export default function ComposeDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="mt-4 h-12 w-full rounded-full text-base font-semibold">
          <FeatherIcon className="size-5" /> Post
        </Button>
      </DialogTrigger>
      <DialogContent className="top-[12%] translate-y-0 gap-0 p-0 sm:max-w-xl">
        <DialogTitle className="border-b px-4 py-3 text-base">New post</DialogTitle>
        <Composer
          autoFocus
          className="border-b-0"
          onPosted={(post) => {
            setOpen(false);
            router.push(`/post/${post.id}`);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
