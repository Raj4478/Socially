"use client";

import Link from "next/link";
import { Fragment } from "react";
import { tokenize } from "@/lib/content";

/** Renders post text with clickable #hashtags, @mentions and links. */
export default function RichText({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className}>
      {tokenize(text).map((token, i) => {
        switch (token.type) {
          case "tag":
            return (
              <Link key={i} href={`/tags/${encodeURIComponent(token.tag)}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                {token.value}
              </Link>
            );
          case "mention":
            return (
              <Link key={i} href={`/profile/${token.username}`} className="text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                {token.value}
              </Link>
            );
          case "url":
            return (
              <a key={i} href={token.href} target="_blank" rel="noopener noreferrer nofollow" className="text-primary hover:underline break-all" onClick={(e) => e.stopPropagation()}>
                {token.value.replace(/^https?:\/\//, "")}
              </a>
            );
          default:
            return <Fragment key={i}>{token.value}</Fragment>;
        }
      })}
    </p>
  );
}
