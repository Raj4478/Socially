/** Parsing for #hashtags, @mentions and links inside post text. Pure, so it runs anywhere. */

export type Token =
  | { type: "text"; value: string }
  | { type: "tag"; value: string; tag: string }
  | { type: "mention"; value: string; username: string }
  | { type: "url"; value: string; href: string };

// url | @mention | #hashtag. Mentions/tags must not be glued to a preceding word (emails, a#b).
// \p{M} keeps combining marks (e.g. Devanagari vowel signs in #भारत) inside the tag.
const TOKEN_RE =
  /(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]])|(?<![\p{L}\p{M}\p{N}_@])@([a-zA-Z0-9_]{1,30})|(?<![\p{L}\p{M}\p{N}_&#])#([\p{L}\p{M}\p{N}_]*\p{L}[\p{L}\p{M}\p{N}_]*)/gu;

export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ type: "text", value: text.slice(last, index) });
    const [value, url, username, tag] = match;
    if (url) tokens.push({ type: "url", value, href: url });
    else if (username) tokens.push({ type: "mention", value, username: username.toLowerCase() });
    else if (tag) tokens.push({ type: "tag", value, tag: normalizeTag(tag) });
    last = index + value.length;
  }
  if (last < text.length) tokens.push({ type: "text", value: text.slice(last) });
  return tokens;
}

export function normalizeTag(tag: string): string {
  return tag.replace(/^#/, "").toLowerCase().slice(0, 50);
}

export function extractHashtags(text: string | null | undefined): string[] {
  if (!text) return [];
  return [...new Set(tokenize(text).flatMap((t) => (t.type === "tag" ? [t.tag] : [])))];
}

export function extractMentions(text: string | null | undefined): string[] {
  if (!text) return [];
  return [...new Set(tokenize(text).flatMap((t) => (t.type === "mention" ? [t.username] : [])))];
}

/** Counts hashtags across posts and returns the most used ones. */
export function topHashtags(contents: (string | null)[], limit = 8): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const content of contents) {
    for (const tag of extractHashtags(content)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

/** Plain-text preview for page titles and link previews. */
export function excerpt(text: string | null | undefined, max = 120): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}
