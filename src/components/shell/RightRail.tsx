import Link from "next/link";
import { getTrendingTags } from "@/actions/post.action";
import { getSuggestions } from "@/actions/users.action";
import UserRow from "@/components/UserRow";
import SearchBox from "./SearchBox";

export default async function RightRail() {
  const [tags, people] = await Promise.all([getTrendingTags(), getSuggestions(3)]);

  return (
    <div className="sticky top-0 flex max-h-screen flex-col gap-4 overflow-y-auto py-3 scrollbar-none">
      <SearchBox />

      {tags.length > 0 && (
        <section className="overflow-hidden rounded-2xl border" aria-labelledby="trending-heading">
          <h2 id="trending-heading" className="px-4 pb-1 pt-3 text-lg font-bold">Trending</h2>
          <ul>
            {tags.slice(0, 6).map((t, i) => (
              <li key={t.tag}>
                <Link href={`/tags/${encodeURIComponent(t.tag)}`} className="block px-4 py-2.5 transition-colors hover:bg-accent/50">
                  <p className="text-xs text-muted-foreground">{i + 1} · Trending this week</p>
                  <p className="font-semibold">#{t.tag}</p>
                  <p className="text-xs text-muted-foreground">{t.count} post{t.count === 1 ? "" : "s"}</p>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/explore" className="block px-4 py-3 text-sm text-primary hover:bg-accent/50">Show more</Link>
        </section>
      )}

      {people.length > 0 && (
        <section className="overflow-hidden rounded-2xl border" aria-labelledby="follow-heading">
          <h2 id="follow-heading" className="px-4 pb-1 pt-3 text-lg font-bold">Who to follow</h2>
          {people.map((u) => (
            <UserRow key={u.id} user={u} following={false} />
          ))}
          <Link href="/explore" className="block px-4 py-3 text-sm text-primary hover:bg-accent/50">Show more</Link>
        </section>
      )}

      <footer className="px-4 text-xs leading-relaxed text-muted-foreground">
        © {new Date().getFullYear()} Socially ·{" "}
        <a href="https://github.com/Raj4478/Socially" className="hover:underline" target="_blank" rel="noreferrer">
          Source
        </a>
      </footer>
    </div>
  );
}
