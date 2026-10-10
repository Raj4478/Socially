import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      icon={CompassIcon}
      title="This page doesn't exist"
      description="The link may be broken, or the post or profile may have been removed."
      action={
        <Button asChild className="rounded-full">
          <Link href="/">Back to home</Link>
        </Button>
      }
    />
  );
}
