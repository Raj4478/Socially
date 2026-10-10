import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { getViewer } from "@/lib/auth";
import { getUnreadCount } from "@/actions/notification.action";
import { Button } from "@/components/ui/button";
import { displayName } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "./Logo";
import ComposeDialog from "./ComposeDialog";
import { SideNavLinks } from "./NavLinks";

export default async function LeftNav() {
  const viewer = await getViewer().catch(() => null);
  const unread = viewer ? await getUnreadCount() : 0;

  return (
    <div className="sticky top-0 flex h-screen flex-col py-3 pr-4">
      <Link href="/" className="mb-3 flex w-fit items-center rounded-full px-3 py-2 hover:bg-accent" aria-label="Socially home">
        <Logo />
      </Link>

      <SideNavLinks username={viewer?.username ?? null} unread={unread} />

      {viewer ? (
        <ComposeDialog />
      ) : (
        <div className="mt-6 space-y-2 rounded-2xl border p-4">
          <p className="font-semibold">New to Socially?</p>
          <p className="text-sm text-muted-foreground">Sign up to post, follow people and join the conversation.</p>
          <SignUpButton mode="modal">
            <Button className="w-full rounded-full font-semibold">Create account</Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button variant="outline" className="w-full rounded-full">Sign in</Button>
          </SignInButton>
        </div>
      )}

      <div className="mt-auto flex items-center gap-2">
        {viewer && (
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-full px-2 py-2">
            <UserButton appearance={{ elements: { avatarBox: "size-10" } }} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName(viewer)}</p>
              <p className="truncate text-sm text-muted-foreground">@{viewer.username}</p>
            </div>
          </div>
        )}
        <div className={viewer ? "" : "ml-1"}>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
