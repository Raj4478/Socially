import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { getUserByClerkId } from "@/actions/users.action";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  HomeIcon, SearchIcon, BellIcon, BookmarkIcon,
  UserIcon, Zap, SettingsIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/",             icon: HomeIcon,     label: "Home" },
  { href: "/explore",      icon: SearchIcon,   label: "Explore" },
  { href: "/notifications",icon: BellIcon,     label: "Notifications" },
  { href: "/bookmarks",    icon: BookmarkIcon, label: "Bookmarks" },
  { href: "/profile",      icon: UserIcon,     label: "Profile" },
];

async function Sidebar() {
  const authUser = await currentUser();

  if (!authUser) {
    return (
      <div className="sticky top-20 space-y-3">
        <nav className="space-y-1">
          {NAV.slice(0, 2).map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors font-medium">
              <Icon className="size-5" />{label}
            </Link>
          ))}
        </nav>
        <div className="rounded-2xl border border-border p-4 space-y-3">
          <p className="font-bold text-lg">New to Socially?</p>
          <p className="text-sm text-muted-foreground">Sign up now to share your thoughts with the world.</p>
          <SignUpButton mode="modal">
            <Button className="w-full rounded-full">Create account</Button>
          </SignUpButton>
          <SignInButton mode="modal">
            <Button variant="outline" className="w-full rounded-full">Sign in</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const user = await getUserByClerkId(authUser.id);
  if (!user) return null;

  const profileHref = `/profile/${user.username}`;

  return (
    <div className="sticky top-16 pt-3 space-y-1">
      {/* Logo — desktop only */}
      <Link href="/" className="flex items-center gap-2 px-3 py-2 mb-2">
        <Zap className="size-7 fill-primary text-primary" />
        <span className="font-black text-xl tracking-tight">Socially</span>
      </Link>

      {NAV.map(({ href, icon: Icon, label }) => {
        const finalHref = label === "Profile" ? profileHref : href;
        return (
          <Link key={href} href={finalHref}
            className="group flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all font-medium text-[15px]">
            <Icon className="size-6 group-hover:scale-110 transition-transform" />
            {label}
          </Link>
        );
      })}

      {/* User mini profile */}
      <div className="mt-4 pt-4 border-t border-border">
        <Link href={profileHref}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/60 transition-colors">
          <Avatar className="size-10">
            <AvatarImage src={user.image || "/avatar.png"} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
          </div>
        </Link>
        <div className="flex gap-4 px-2 mt-2 text-sm text-muted-foreground">
          <span><b className="text-foreground">{user._count.following}</b> Following</span>
          <span><b className="text-foreground">{user._count.followers}</b> Followers</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
