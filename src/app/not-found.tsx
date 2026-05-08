export const dynamic = "force-dynamic";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center px-4">
      <div className="relative">
        <div className="text-8xl font-black gradient-text leading-none">404</div>
        <div className="absolute inset-0 blur-3xl opacity-20 bg-primary rounded-full" />
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-2">Page not found</h2>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
          This page doesn&apos;t exist or the user may have changed their username.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity glow-sm"
        >
          Go home
        </Link>
        <Link
          href="/explore"
          className="px-6 py-2.5 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-muted transition-colors"
        >
          Explore
        </Link>
      </div>
    </div>
  );
}
