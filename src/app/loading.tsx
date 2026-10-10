import { FeedSkeleton } from "@/components/PostSkeleton";

export default function Loading() {
  return (
    <>
      <div className="sticky top-14 z-30 h-14 border-b bg-background/85 backdrop-blur-md lg:top-0" />
      <FeedSkeleton count={6} />
    </>
  );
}
