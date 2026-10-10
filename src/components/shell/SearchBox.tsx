"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HashIcon, SearchIcon, XIcon } from "lucide-react";
import { searchUsers } from "@/actions/users.action";
import type { SuggestedUser } from "@/lib/types";
import { displayName } from "@/lib/utils";
import UserAvatar from "@/components/UserAvatar";

/** Search field with live people suggestions; Enter opens full results on /explore. */
export default function SearchBox({ defaultValue = "", autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [people, setPeople] = useState<SuggestedUser[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2 || term.startsWith("#")) return setPeople([]);
    let active = true;
    const t = setTimeout(() => searchUsers(term).then((r) => active && setPeople(r.slice(0, 5))), 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => !boxRef.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const go = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setOpen(false);
    if (t.startsWith("#") && t.length > 1) router.push(`/tags/${encodeURIComponent(t.slice(1).toLowerCase())}`);
    else router.push(`/explore?q=${encodeURIComponent(t)}`);
  };

  const term = q.trim();
  return (
    <div ref={boxRef} className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
      >
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search people, posts or #tags"
          aria-label="Search"
          className="h-11 w-full rounded-full border border-transparent bg-secondary pl-11 pr-10 text-[15px] outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent" aria-label="Clear search">
            <XIcon className="size-4" />
          </button>
        )}
      </form>

      {open && term.length > 0 && (
        <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-xl border bg-popover shadow-lg">
          <button type="button" onClick={() => go(q)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-accent">
            {term.startsWith("#") ? <HashIcon className="size-4 text-muted-foreground" /> : <SearchIcon className="size-4 text-muted-foreground" />}
            Search for &ldquo;<span className="truncate font-medium">{term}</span>&rdquo;
          </button>
          {people.map((u) => (
            <Link
              key={u.id}
              href={`/profile/${u.username}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 border-t px-4 py-2.5 hover:bg-accent"
            >
              <UserAvatar user={u} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{displayName(u)}</p>
                <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
