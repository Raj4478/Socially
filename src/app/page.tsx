import { getFeed } from "@/actions/post.action";
import { getViewerId } from "@/lib/auth";
import { feedTab } from "@/lib/validation";
import HomeFeed from "@/components/HomeFeed";
import TabLinks from "@/components/TabLinks";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const tab = feedTab.parse((await searchParams).tab);
  const [viewerId, initial] = await Promise.all([getViewerId(), getFeed(tab)]);

  return (
    <>
      <header className="sticky top-14 z-30 border-b bg-background/85 backdrop-blur-md lg:top-0">
        <h1 className="sr-only">Home</h1>
        <TabLinks
          active={tab}
          tabs={[
            { value: "for-you", label: "For you", href: "/" },
            { value: "following", label: "Following", href: "/?tab=following" },
          ]}
        />
      </header>
      <HomeFeed tab={tab} initial={initial} loadMore={getFeed.bind(null, tab)} viewerId={viewerId} />
    </>
  );
}
