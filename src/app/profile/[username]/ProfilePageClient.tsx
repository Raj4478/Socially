"use client";
// @ts-nocheck
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
import { motion, AnimatePresence } from "framer-motion";

type User = NonNullable<Awaited<ReturnType<typeof getProfileByUsername>>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface Props {
  user: User; posts: Posts; likedPosts: Posts;
  isFollowing: boolean; dbUserId: string | null;
}

export default function ProfilePageClient({ isFollowing: initFollowing, likedPosts, posts, user, dbUserId }: Props) {
  const { user: currentUser } = useUser();
  const [showEdit, setShowEdit] = useState(false);
  const [following, setFollowing] = useState(initFollowing);
  const [updatingFollow, setUpdatingFollow] = useState(false);
  const [followerCount, setFollowerCount] = useState(user._count.followers);
  const [editForm, setEditForm] = useState({
    name: user.name || "", bio: user.bio || "",
    location: user.location || "", website: user.website || "",
  });

  const isOwn = currentUser?.username === user.username ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.username;

  const handleFollow = async () => {
    if (!currentUser) return;
    try {
      setUpdatingFollow(true);
      await toggleFollow(user.id);
      setFollowing((p) => !p);
      setFollowerCount((p: number) => p + (following ? -1 : 1));
    } catch { toast.error("Failed"); }
    finally { setUpdatingFollow(false); }
  };

  const handleEdit = async () => {
    const fd = new FormData();
    Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
    const res = await updateProfile(fd);
    if (res.success) { setShowEdit(false); toast.success("Profile updated ✨"); }
  };

  return (
    <div>
      {/* Cover image */}
      <div className="relative h-40 sm:h-52 overflow-hidden">
        {user.coverImage ? (
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full"
            style={{
              background: "linear-gradient(135deg, oklch(0.58 0.24 264 / 0.4), oklch(0.67 0.22 300 / 0.4), oklch(0.58 0.24 264 / 0.2))"
            }}
          >
            {/* Animated mesh */}
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, oklch(0.67 0.22 264 / 0.6) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, oklch(0.7 0.25 300 / 0.5) 0%, transparent 50%)`
              }} />
          </div>
        )}
      </div>

      {/* Header */}
      <div className="px-4 pb-3">
        <div className="flex items-end justify-between -mt-14 sm:-mt-16 mb-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="avatar-ring glow-sm">
              <Avatar className="size-24 sm:size-28 border-4 border-background">
                <AvatarImage src={user.image ?? "/avatar.png"} />
                <AvatarFallback className="text-3xl font-black">{user.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-1"
          >
            {!currentUser ? (
              <SignInButton mode="modal">
                <Button className="rounded-full px-5 font-bold glow-sm">Follow</Button>
              </SignInButton>
            ) : isOwn ? (
              <Button variant="outline" onClick={() => setShowEdit(true)}
                className="rounded-full px-5 font-bold gradient-border">
                <EditIcon className="size-4 mr-2" />Edit profile
              </Button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleFollow}
                disabled={updatingFollow}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                  following
                    ? "border border-border hover:border-red-500 hover:text-red-500 bg-transparent"
                    : "bg-foreground text-background hover:bg-foreground/90 glow-sm"
                }`}
              >
                {updatingFollow ? "..." : following ? "Following" : "Follow"}
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* User info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div>
            <h1 className="font-black text-xl">{user.name ?? user.username}</h1>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
          </div>
          {user.bio && <p className="text-sm leading-relaxed">{user.bio}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {user.location && (
              <span className="flex items-center gap-1.5"><MapPinIcon className="size-3.5 text-primary" />{user.location}</span>
            )}
            {user.website && (
              <a href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                className="flex items-center gap-1.5 text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                <LinkIcon className="size-3.5" />{user.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 text-primary" />
              Joined {format(new Date(user.createdAt), "MMMM yyyy")}
            </span>
          </div>

          <div className="flex gap-5 text-sm pt-1">
            {[
              { val: user._count.following, label: "Following" },
              { val: followerCount, label: "Followers" },
              { val: user._count.posts, label: "Posts" },
            ].map(({ val, label }) => (
              <motion.span key={label} className="flex items-baseline gap-1">
                <motion.b
                  key={val}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="font-bold"
                >{val.toLocaleString()}</motion.b>
                <span className="text-muted-foreground">{label}</span>
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="w-full grid grid-cols-2 rounded-none h-auto p-0 bg-transparent border-b border-border/60 sticky top-14 z-10 bg-background/80 backdrop-blur-xl">
          {[
            { value: "posts", icon: FileTextIcon, label: "Posts", count: posts.length },
            { value: "likes", icon: HeartIcon, label: "Likes", count: likedPosts.length },
          ].map(({ value, icon: Icon, label, count }) => (
            <TabsTrigger key={value} value={value}
              className="relative flex items-center gap-2 rounded-none py-3.5 data-[state=active]:bg-transparent font-semibold text-muted-foreground data-[state=active]:text-foreground transition-all group">
              <Icon className="size-4 group-data-[state=active]:text-primary" />
              {label}
              <span className="text-xs text-muted-foreground">({count})</span>
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 opacity-0 group-data-[state=active]:opacity-100 transition-opacity rounded-t-full" />
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {posts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <FileTextIcon className="size-10 mx-auto mb-3 opacity-30" />
              No posts yet
            </div>
          ) : posts.map((p: any) => <PostCard key={p.id} post={p} dbUserId={dbUserId} />)}
        </TabsContent>

        <TabsContent value="likes" className="mt-0">
          {likedPosts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <HeartIcon className="size-10 mx-auto mb-3 opacity-30" />
              No liked posts
            </div>
          ) : likedPosts.map((p: any) => <PostCard key={p.id} post={p} dbUserId={dbUserId} />)}
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md rounded-2xl glass">
          <DialogHeader>
            <DialogTitle className="gradient-text text-lg font-bold">Edit profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { key: "name", label: "Name", placeholder: "Your name" },
              { key: "location", label: "Location", placeholder: "Where are you based?" },
              { key: "website", label: "Website", placeholder: "yourwebsite.com" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</Label>
                <Input placeholder={placeholder} value={(editForm as any)[key]}
                  onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                  className="rounded-xl floating-input" />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Bio</Label>
              <Textarea placeholder="Tell the world about yourself" value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="resize-none min-h-[80px] rounded-xl floating-input" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="rounded-full">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEdit} className="rounded-full glow-sm">Save changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
