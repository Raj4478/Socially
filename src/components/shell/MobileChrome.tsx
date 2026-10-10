import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { getViewer } from "@/lib/auth";
import { getUnreadCount } from "@/actions/notification.action";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "./Logo";
import { BottomNavLinks } from "./NavLinks";

/** Top bar and bottom tab bar shown below the lg breakpoint. */
export default async function MobileChrome() {
  const viewer = await getViewer().catch(() => null);
  const unread = viewer ? await getUnreadCount() : 0;
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b bg-background/90 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" aria-label="Socially home">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {viewer ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" className="rounded-full px-4 font-semibold">Sign in</Button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>
      <BottomNavLinks username={viewer?.username ?? null} unread={unread} />
    </>
  );
}
