"use client";

import { useEffect } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={AlertTriangleIcon}
      title="Something went wrong"
      description={
        <>
          This page couldn&apos;t load. Please try again.
          {error.digest && <span className="mt-2 block font-mono text-xs">Reference: {error.digest}</span>}
        </>
      }
      action={<Button onClick={reset} className="rounded-full">Try again</Button>}
    />
  );
}
