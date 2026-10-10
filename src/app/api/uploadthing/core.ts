import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

async function signedIn() {
  const { userId } = await auth();
  if (!userId) throw new UploadThingError("Please sign in to upload images");
  return { userId };
}

export const ourFileRouter = {
  postImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(signedIn)
    .onUploadComplete(({ file }) => ({ fileUrl: file.ufsUrl })),

  coverImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(signedIn)
    .onUploadComplete(({ file }) => ({ fileUrl: file.ufsUrl })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
