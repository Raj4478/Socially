export const dynamic = "force-dynamic";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
      <div className="text-8xl font-black gradient-text">404</div>
      <div>
        <h2 className="font-bold text-2xl mb-2">Page not found</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          This page doesn&apos;t exist or has been removed.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity glow-sm"
      >
        Back to home
      </Link>
    </div>
  );
}
