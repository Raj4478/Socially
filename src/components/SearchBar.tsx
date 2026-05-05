"use client";

import { useState, useTransition } from "react";
import { SearchIcon, XIcon, Loader2Icon } from "lucide-react";
import { searchUsers } from "@/actions/users.action";
import { searchPosts } from "@/actions/post.action";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) { setUsers([]); return; }
    startTransition(async () => {
      const results = await searchUsers(val);
      setUsers(results);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
      setFocused(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-muted border border-transparent focus-within:border-primary focus-within:bg-background transition-all">
        {isPending ? <Loader2Icon className="size-4 text-muted-foreground animate-spin shrink-0" />
                   : <SearchIcon className="size-4 text-muted-foreground shrink-0" />}
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          placeholder="Search Socially"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); setUsers([]); }}>
            <XIcon className="size-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </form>

      {focused && users.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
          {users.map((u) => (
            <Link key={u.id} href={`/profile/${u.username}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors">
              <Avatar className="size-9">
                <AvatarImage src={u.image || "/avatar.png"} />
                <AvatarFallback>{u.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{u.name}</p>
                <p className="text-xs text-muted-foreground">@{u.username}</p>
              </div>
            </Link>
          ))}
          <button
            onMouseDown={() => router.push(`/explore?q=${encodeURIComponent(query)}`)}
            className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-muted/60 transition-colors border-t border-border">
            Search for "{query}"
          </button>
        </div>
      )}
    </div>
  );
}
