"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CameraIcon, Loader2Icon, XIcon } from "lucide-react";
import { updateProfile } from "@/actions/profile.action";
import { useUploadThing } from "@/lib/uploadthing";
import type { ProfileDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export default function EditProfileDialog({ profile }: { profile: ProfileDTO }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: profile.name ?? "",
    bio: profile.bio ?? "",
    location: profile.location ?? "",
    website: profile.website ?? "",
    coverImage: profile.coverImage ?? "",
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const { startUpload, isUploading } = useUploadThing("coverImage", {
    onClientUploadComplete: (res) => setForm((f) => ({ ...f, coverImage: res[0]?.ufsUrl ?? "" })),
    onUploadError: (e) => {
      toast.error(e.message || "Upload failed");
    },
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile(form);
    setSaving(false);
    if (!res.success) return void toast.error(res.error);
    toast.success("Profile updated");
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full font-semibold">Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Your photo and username come from your account settings.</DialogDescription>
        </DialogHeader>

        <form id="profile-form" onSubmit={save} className="space-y-4">
          <div className="relative aspect-[3/1] overflow-hidden rounded-lg bg-gradient-to-br from-primary/25 via-primary/10 to-secondary">
            {form.coverImage && <img src={form.coverImage} alt="" className="size-full object-cover" />}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/25">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) startUpload([file]);
                  e.target.value = "";
                }}
              />
              <Button type="button" size="icon" variant="secondary" className="rounded-full bg-black/60 text-white hover:bg-black/80" onClick={() => fileRef.current?.click()} aria-label="Change cover photo" disabled={isUploading}>
                {isUploading ? <Loader2Icon className="animate-spin" /> : <CameraIcon />}
              </Button>
              {form.coverImage && (
                <Button type="button" size="icon" variant="secondary" className="rounded-full bg-black/60 text-white hover:bg-black/80" onClick={() => setForm((f) => ({ ...f, coverImage: "" }))} aria-label="Remove cover photo">
                  <XIcon />
                </Button>
              )}
            </div>
          </div>

          <Field id="name" label="Name" hint={`${form.name.length}/50`}>
            <Input id="name" value={form.name} onChange={set("name")} maxLength={50} required />
          </Field>
          <Field id="bio" label="Bio" hint={`${form.bio.length}/160`}>
            <Textarea id="bio" value={form.bio} onChange={set("bio")} maxLength={160} rows={3} placeholder="Tell people about yourself" />
          </Field>
          <Field id="location" label="Location">
            <Input id="location" value={form.location} onChange={set("location")} maxLength={30} placeholder="City, country" />
          </Field>
          <Field id="website" label="Website">
            <Input id="website" value={form.website} onChange={set("website")} maxLength={100} placeholder="yourwebsite.com" inputMode="url" />
          </Field>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="profile-form" disabled={saving || isUploading} className="rounded-full px-5">
            {saving && <Loader2Icon className="animate-spin" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
