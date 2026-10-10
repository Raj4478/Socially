import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost } from "@/actions/post.action";
import { getViewerId } from "@/lib/auth";
import { excerpt } from "@/lib/content";
import { displayName } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).id);
  if (!post) return { title: "Post not found" };
  const author = `${displayName(post.author)} (@${post.author.username})`;
  const text = excerpt(post.content, 160) || "Shared a photo";
  return {
    title: `${author}: “${excerpt(post.content, 60) || "Photo"}”`,
    description: text,
    openGraph: { type: "article", title: author, description: text, ...(post.image ? { images: [post.image] } : {}) },
    twitter: { card: post.image ? "summary_large_image" : "summary", title: author, description: text },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const [post, viewerId] = await Promise.all([getPost(id), getViewerId()]);
  if (!post) notFound();

  return (
    <>
      <PageHeader title="Post" back />
      <PostCard post={post} viewerId={viewerId} defaultShowComments linkToPost={false} />
    </>
  );
}
