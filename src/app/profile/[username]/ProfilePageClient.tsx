"use client";

import { getProfileByUsername, getUserPosts, updateProfile } from "@/actions/profile.action";
import { toggleFollow } from "@/actions/users.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { CalendarIcon, EditIcon, FileTextIcon, HeartIcon, LinkIcon, MapPinIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type User = NonNullable<Awaited<ReturnType<typeof getProfileByUsername>>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface Props {
  user: User;
  posts: Posts;
  likedPosts: Posts;
  isFollowing: boolean;
  dbUserId: string | null;
}

function ProfilePageClient({ isFollowing: initFollowing, likedPosts, posts, user, dbUserId }: Props) {
  const { user: currentUser } = useUser();
  const [showEdit, setShowEdit] = useState(false);
  const [following, setFollowing] = useState(initFollowing);
  const [updatingFollow, setUpdatingFollow] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || "",
  });

  const isOwn = currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const handleFollow = async () => {
    if (!currentUser) return;
    try {
      setUpdatingFollow(true);
      await toggleFollow(user.id);
      setFollowing((p) => !p);
    } catch { toast.error("Failed to update follow"); }
    finally { setUpdatingFollow(false); }
  };

  const handleEditSubmit = async () => {
    const fd = new FormData();
    Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
    const res = await updateProfile(fd);
    if (res.success) { setShowEdit(false); toast.success("Profile updated"); }
  };

  return (
    <div>
      {/* Cover */}
      <div className="h-36 sm:h-48 bg-gradient-to-br from-primary/30 via-primary/10 to-background relative">
        {user.coverImage && (
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile header */}
      <div className="px-4">
        <div className="flex items-end justify-between -mt-14 mb-3">
          <div className="avatar-ring inline-block">
            <Avatar className="size-24 sm:size-28 border-4 border-background">
              <AvatarImage src={user.image ?? "/avatar.png"} />
              <AvatarFallback className="text-3xl">{user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>

          <div className="mb-1">
            {!currentUser ? (
              <SignInButton mode="modal">
                <Button className="rounded-full px-5 font-bold">Follow</Button>
              </SignInButton>
            ) : isOwn ? (
              <Button variant="outline" className="rounded-full px-5 font-bold" onClick={() => setShowEdit(true)}>
                <EditIcon className="size-4 mr-2" /> Edit profile
              </Button>
            ) : (
              <Button
                className="rounded-full px-5 font-bold"
                variant={following ? "outline" : "default"}
                onClick={handleFollow}
                disabled={updatingFollow}
              >
                {following ? "Following" : "Follow"}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1 mb-3">
          <h1 className="font-bold text-xl">{user.name ?? user.username}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="text-sm leading-relaxed">{user.bio}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground pt-1">
            {user.location && (
              <span className="flex items-center gap-1"><MapPinIcon className="size-3.5" />{user.location}</span>
            )}
            {user.website && (
              <a href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                className="flex items-center gap-1 text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                <LinkIcon className="size-3.5" />{user.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3.5" />Joined {format(new Date(user.createdAt), "MMMM yyyy")}
            </span>
          </div>

          <div className="flex gap-5 text-sm pt-1">
            <span><b>{user._count.following.toLocaleString()}</b> <span className="text-muted-foreground">Following</span></span>
            <span><b>{user._count.followers.toLocaleString()}</b> <span className="text-muted-foreground">Followers</span></span>
            <span><b>{user._count.posts.toLocaleString()}</b> <span className="text-muted-foreground">Posts</span></span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent sticky top-14 z-10 bg-background/80 backdrop-blur-md">
          {[
            { value: "posts", icon: FileTextIcon, label: "Posts" },
            { value: "likes", icon: HeartIcon, label: "Likes" },
          ].map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value}
              className="flex-1 max-w-[140px] flex items-center gap-2 rounded-none py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent font-semibold text-muted-foreground data-[state=active]:text-foreground">
              <Icon className="size-4" />{label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {posts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No posts yet</div>
          ) : posts.map((p) => <PostCard key={p.id} post={p} dbUserId={dbUserId} />)}
        </TabsContent>

        <TabsContent value="likes" className="mt-0">
          {likedPosts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No liked posts</div>
          ) : likedPosts.map((p) => <PostCard key={p.id} post={p} dbUserId={dbUserId} />)}
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { key: "name", label: "Name", placeholder: "Your name" },
              { key: "location", label: "Location", placeholder: "Where are you based?" },
              { key: "website", label: "Website", placeholder: "yourwebsite.com" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label>{label}</Label>
                <Input placeholder={placeholder} value={(editForm as any)[key]}
                  onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <Textarea placeholder="Tell the world about yourself" value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="resize-none min-h-[80px]" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild><Button variant="outline" className="rounded-full">Cancel</Button></DialogClose>
            <Button onClick={handleEditSubmit} className="rounded-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfilePageClient;
