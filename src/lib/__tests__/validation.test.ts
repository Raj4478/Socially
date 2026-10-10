import { describe, expect, it } from "vitest";
import { commentInput, feedTab, postInput, profileInput, POST_MAX } from "../validation";

describe("postInput", () => {
  it("accepts text-only and image-only posts", () => {
    expect(postInput.parse({ content: "  hello  " })).toEqual({ content: "hello", image: "" });
    expect(postInput.parse({ image: "https://abc.ufs.sh/f/xyz" }).image).toBe("https://abc.ufs.sh/f/xyz");
  });

  it("rejects empty posts", () => {
    expect(postInput.safeParse({ content: "   " }).success).toBe(false);
  });

  it("rejects posts over the limit", () => {
    const res = postInput.safeParse({ content: "x".repeat(POST_MAX + 1) });
    expect(res.success).toBe(false);
  });

  it("only allows images from our upload hosts over https", () => {
    expect(postInput.safeParse({ image: "https://evil.example/cat.png" }).success).toBe(false);
    expect(postInput.safeParse({ image: "http://utfs.io/f/abc" }).success).toBe(false);
    expect(postInput.safeParse({ image: "https://utfs.io/f/abc" }).success).toBe(true);
    expect(postInput.safeParse({ image: "javascript:alert(1)" }).success).toBe(false);
  });
});

describe("commentInput", () => {
  it("trims and requires content", () => {
    expect(commentInput.parse({ content: " hi " }).content).toBe("hi");
    expect(commentInput.safeParse({ content: "  " }).success).toBe(false);
  });
});

describe("profileInput", () => {
  it("adds https:// to bare websites", () => {
    expect(profileInput.parse({ name: "Raj", website: "raj.dev" }).website).toBe("https://raj.dev");
  });

  it("allows clearing optional fields", () => {
    expect(profileInput.parse({ name: "Raj", bio: "", website: "" })).toMatchObject({ bio: "", website: "" });
  });

  it("rejects bad input", () => {
    expect(profileInput.safeParse({ name: "" }).success).toBe(false);
    expect(profileInput.safeParse({ name: "Raj", bio: "x".repeat(161) }).success).toBe(false);
    expect(profileInput.safeParse({ name: "Raj", website: "not a url" }).success).toBe(false);
  });
});

describe("feedTab", () => {
  it("falls back to for-you for unknown values", () => {
    expect(feedTab.parse("following")).toBe("following");
    expect(feedTab.parse("weird")).toBe("for-you");
    expect(feedTab.parse(undefined)).toBe("for-you");
  });
});
