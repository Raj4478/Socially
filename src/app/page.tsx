import { currentUser } from "@clerk/nextjs/server";
import CreatePost from "@/components/CreatePost";
import WhoToFollow from "@/components/WhoToFollow";
import PostCard from "@/components/PostCard";
import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/users.action";

export default async function Home() {
  try {
    const user = await currentUser();
    const posts = await getPosts();
    const dbUserId = await getDbUserId();
    return (
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        <div className="lg:col-span-6">
          {user ? <CreatePost /> : null}
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} dbUserId={dbUserId} />
            ))}
          </div>
        </div>
        <div className="hidden lg:block lg:col-span-4 sticky top-20">
          <WhoToFollow />
        </div>
      </div>
    );
  } catch (error) {
    // Show error message for debugging
    return <div>Error: {String(error)}</div>;
  }
}
