import type { Metadata } from "next";
import Link from "next/link";
import { SearchXIcon } from "lucide-react";
import { getFeed, getTrendingTags, searchPosts } from "@/actions/post.action";
import { getFollowingIds, getSuggestions, searchUsers } from "@/actions/users.action";
import { getViewerId } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";
import SearchBox from "@/components/shell/SearchBox";
import TabLinks from "@/components/TabLinks";
import UserRow from "@/components/UserRow";
import PostCard from "@/components/PostCard";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Explore" };

type Props = { searchParams: Promise<{ q?: string; type?: string }> };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b">
      <h2 className="px-4 pb-1 pt-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default async function ExplorePage({ searchParams }: Props) {
  const { q = "", type } = await searchParams;
  const query = q.trim().slice(0, 100);
  const viewerId = await getViewerId();

  const header = (
    <PageHeader title="Explore">
      <div className="px-4 pb-3 xl:hidden">
        <SearchBox defaultValue={query} />
      </div>
      {query && (
        <TabLinks
          active={type === "people" ? "people" : "posts"}
          tabs={[
            { value: "posts", label: "Posts", href: `/explore?q=${encodeURIComponent(query)}` },
            { value: "people", label: "People", href: `/explore?q=${encodeURIComponent(query)}&type=people` },
          ]}
        />
      )}
    </PageHeader>
  );

  if (query) {
    if (type === "people") {
      const people = await searchUsers(query);
      const following = new Set(await getFollowingIds(people.map((p) => p.id)));
      return (
        <>
          {header}
          {people.length === 0 ? (
            <EmptyState icon={SearchXIcon} title={`No people match “${query}”`} description="Try a name or @username." />
          ) : (
            people.map((u) => <UserRow key={u.id} user={u} following={following.has(u.id)} showBio showFollow={u.id !== viewerId} />)
          )}
        </>
      );
    }
    const posts = await searchPosts(query);
    return (
      <>
        {header}
        {posts.length === 0 ? (
          <EmptyState icon={SearchXIcon} title={`No posts match “${query}”`} description="Try different words, or search people instead." />
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} viewerId={viewerId} />)
        )}
      </>
    );
  }

  const [tags, people, latest] = await Promise.all([getTrendingTags(), getSuggestions(6), getFeed("for-you")]);
  return (
    <>
      {header}
      {tags.length > 0 && (
        <Section title="Trending topics">
          <div className="flex flex-wrap gap-2 px-4 pb-4 pt-2">
            {tags.map((t) => (
              <Link
                key={t.tag}
                href={`/tags/${encodeURIComponent(t.tag)}`}
                className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                #{t.tag} <span className="text-muted-foreground">{t.count}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}
      {people.length > 0 && (
        <Section title="People to follow">
          {people.map((u) => <UserRow key={u.id} user={u} following={false} showBio />)}
        </Section>
      )}
      <Section title="Latest posts">
        {latest.items.slice(0, 10).map((p) => <PostCard key={p.id} post={p} viewerId={viewerId} />)}
      </Section>
    </>
  );
}
