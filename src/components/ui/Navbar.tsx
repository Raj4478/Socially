import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import ModeToggle from "@/components/ModeToggle";
import { Button } from "./button";
import { Zap } from "lucide-react";
import MobileBottomNav from "./MobileBottomNav";

async function Navbar() {
  const user = await currentUser();

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-14 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Zap className="size-6 fill-primary" />
            <span className="hidden sm:block">Socially</span>
          </Link>

          <div className="flex items-center gap-2">
            <ModeToggle />
            {user ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" className="rounded-full px-5">Sign in</Button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </>
  );
}

export default Navbar;
