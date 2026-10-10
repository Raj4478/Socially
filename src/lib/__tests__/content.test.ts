import { describe, expect, it } from "vitest";
import { excerpt, extractHashtags, extractMentions, tokenize, topHashtags } from "../content";

describe("tokenize", () => {
  it("splits text, tags, mentions and links", () => {
    const tokens = tokenize("Hi @Raj check #NextJS at https://nextjs.org/docs.");
    expect(tokens).toEqual([
      { type: "text", value: "Hi " },
      { type: "mention", value: "@Raj", username: "raj" },
      { type: "text", value: " check " },
      { type: "tag", value: "#NextJS", tag: "nextjs" },
      { type: "text", value: " at " },
      { type: "url", value: "https://nextjs.org/docs", href: "https://nextjs.org/docs" },
      { type: "text", value: "." },
    ]);
  });

  it("ignores emails, HTML entities and pure-number hashes", () => {
    expect(extractMentions("mail me at raj@example.com")).toEqual([]);
    expect(extractHashtags("&#39; and issue #42 and a#b")).toEqual([]);
  });

  it("keeps non-latin hashtags", () => {
    expect(extractHashtags("नमस्ते #भारत and #café")).toEqual(["भारत", "café"]);
  });

  it("round-trips the original text", () => {
    const text = "Mixed #one @two https://x.dev end";
    expect(tokenize(text).map((t) => t.value).join("")).toBe(text);
  });
});

describe("extractHashtags", () => {
  it("dedupes case-insensitively", () => {
    expect(extractHashtags("#React #react #REACT #vue")).toEqual(["react", "vue"]);
  });
  it("handles empty input", () => {
    expect(extractHashtags(null)).toEqual([]);
  });
});

describe("topHashtags", () => {
  it("ranks by count then name, counting a tag once per post", () => {
    const top = topHashtags(["#a #a #b", "#b #c", "#b", null, "#c"], 2);
    expect(top).toEqual([
      { tag: "b", count: 3 },
      { tag: "c", count: 2 },
    ]);
  });
});

describe("excerpt", () => {
  it("collapses whitespace and truncates with an ellipsis", () => {
    expect(excerpt("  hello\n\nworld  ")).toBe("hello world");
    expect(excerpt("abcdefghij", 5)).toBe("abcd…");
  });
});
