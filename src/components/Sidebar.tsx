import { currentUser } from "@clerk/nextjs/server";
import SidebarClient from "./SidebarClient";
import { getUserByClerkId } from "@/actions/users.action";
import { Button } from "./ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

async function Sidebar() {
  const authUser = await currentUser();

  if (!authUser) {
    return (
      <div className="sticky top-20 space-y-4 pt-3">
        <div className="glass rounded-2xl p-5 space-y-3">
          <p className="font-bold text-lg">New to Socially?</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Join millions sharing ideas and connecting with the world.
          </p>
          <SignUpButton mode="modal">
            <Button className="w-full rounded-full font-bold glow-sm">Create account</Button>
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

  return (
    <SidebarClient
      username={user.username}
      name={user.name || ""}
      image={user.image || ""}
      following={user._count.following}
      followers={user._count.followers}
    />
  );
}

export default Sidebar;
