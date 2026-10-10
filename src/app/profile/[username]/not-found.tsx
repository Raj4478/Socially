import Link from "next/link";
import { UserXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

export default function ProfileNotFound() {
  return (
    <EmptyState
      icon={UserXIcon}
      title="This account doesn't exist"
      description="Try searching for someone else."
      action={
        <Button asChild className="rounded-full">
          <Link href="/explore">Search people</Link>
        </Button>
      }
    />
  );
}
