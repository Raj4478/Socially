"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import ModeToggle from "./ModeToggle";
import { Zap } from "lucide-react";
import MobileBottomNav from "./ui/MobileBottomNav";

export default function NavbarClient({ isSignedIn }: { isSignedIn: boolean }) {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 60], [0, 16]);
  const bg = useTransform(scrollY, [0, 60], ["oklch(0 0 0 / 0)", "oklch(0 0 0 / 0.001)"]);

  return (
    <>
      <motion.header
        style={{ backdropFilter: blur.get() > 0 ? `blur(${blur.get()}px)` : "none" }}
        className="fixed top-0 inset-x-0 z-50 h-14 border-b border-border/60 bg-background/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Zap className="size-6 fill-primary text-primary drop-shadow-[0_0_8px_oklch(0.67_0.22_264/0.8)]" />
            </motion.div>
            <span className="font-black text-lg tracking-tight gradient-text hidden sm:block">Socially</span>
          </Link>

          <div className="flex items-center gap-2">
            <ModeToggle />
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <Button size="sm" className="rounded-full px-5 font-semibold glow-sm">
                  Sign in
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </motion.header>
      <MobileBottomNav />
    </>
  );
}
