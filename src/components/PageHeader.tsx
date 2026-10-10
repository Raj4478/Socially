"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Sticky title bar at the top of the main column. */
export default function PageHeader({
  title,
  subtitle,
  back = false,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  back?: boolean;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-14 z-30 border-b bg-background/85 backdrop-blur-md lg:top-0">
      <div className="flex h-14 items-center gap-3 px-4">
        {back && (
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 rounded-full"
            aria-label="Go back"
            onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </header>
  );
}
