import { z } from "zod";

export const POST_MAX = 280;
export const COMMENT_MAX = 280;

// Only images we host (UploadThing) or that Clerk serves can be attached.
const IMAGE_HOSTS = [/(^|\.)utfs\.io$/, /(^|\.)ufs\.sh$/, /(^|\.)uploadthing\.com$/, /(^|\.)clerk\.com$/, /(^|\.)clerk\.dev$/];

export const imageUrl = z
  .string()
  .trim()
  .url("Invalid image")
  .refine((value) => {
    try {
      const { protocol, hostname } = new URL(value);
      return protocol === "https:" && IMAGE_HOSTS.some((re) => re.test(hostname));
    } catch {
      return false;
    }
  }, "Images must be uploaded through Socially");

export const id = z.string().trim().min(1, "Missing id").max(64, "Invalid id");

export const postInput = z
  .object({
    content: z.string().trim().max(POST_MAX, `Posts can be at most ${POST_MAX} characters`).default(""),
    image: z.union([imageUrl, z.literal("")]).default(""),
  })
  .refine((p) => p.content.length > 0 || p.image.length > 0, "Write something or add a photo");

export const postEditInput = z.object({
  content: z.string().trim().max(POST_MAX, `Posts can be at most ${POST_MAX} characters`),
});

export const commentInput = z.object({
  content: z.string().trim().min(1, "Comment can't be empty").max(COMMENT_MAX, `Comments can be at most ${COMMENT_MAX} characters`),
});

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} can be at most ${max} characters`).optional().default("");

export const profileInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name can be at most 50 characters"),
  bio: optionalText(160, "Bio"),
  location: optionalText(30, "Location"),
  website: z
    .string()
    .trim()
    .max(100, "Website is too long")
    .optional()
    .default("")
    .transform((v) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v))
    .refine((v) => !v || z.string().url().safeParse(v).success, "Enter a valid website"),
  coverImage: z.union([imageUrl, z.literal("")]).optional().default(""),
});

export const searchQuery = z.string().trim().max(100).default("");

export const feedTab = z.enum(["for-you", "following"]).catch("for-you");

export type PostInput = z.input<typeof postInput>;
export type ProfileInput = z.input<typeof profileInput>;
