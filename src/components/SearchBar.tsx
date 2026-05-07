"use client";

import { useState, useTransition } from "react";
import { SearchIcon, XIcon, Loader2Icon } from "lucide-react";
import { searchUsers } from "@/actions/users.action";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

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
      const res = await searchUsers(val);
      setUsers(res);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
      setFocused(false);
    }
  };

  const containerClass = focused
    ? "bg-background border border-primary/40 shadow-lg shadow-primary/10"
    : "bg-muted/60 border border-transparent hover:bg-muted";

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-full transition-all duration-200 ${containerClass}`}
      >
        {isPending ? (
          <Loader2Icon className="size-4 text-primary animate-spin shrink-0" />
        ) : (
          <SearchIcon className={`size-4 shrink-0 transition-colors ${focused ? "text-primary" : "text-muted-foreground"}`} />
        )}
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search Socially"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              type="button"
              onClick={() => { setQuery(""); setUsers([]); }}
              className="size-4 rounded-full bg-muted-foreground/30 flex items-center justify-center hover:bg-muted-foreground/50 transition-colors"
            >
              <XIcon className="size-2.5 text-muted-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      <AnimatePresence>
        {focused && users.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {users.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/profile/${u.username}`}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 transition-colors"
                >
                  <div className="avatar-ring shrink-0">
                    <Avatar className="size-8">
                      <AvatarImage src={u.image || "/avatar.png"} />
                      <AvatarFallback className="text-xs font-bold">{u.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">@{u.username}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
            <button
              onMouseDown={() => router.push(`/explore?q=${encodeURIComponent(query)}`)}
              className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors border-t border-border/60 font-medium"
            >
              Search for &ldquo;{query}&rdquo;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
