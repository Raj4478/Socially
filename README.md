# Socially

A social platform for sharing short posts, following people and joining conversations around #topics. Built with Next.js 15 (App Router), Prisma + PostgreSQL, Clerk and UploadThing.

**Live:** [socially-hcia.vercel.app](https://socially-hcia.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript_strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## Features

- **Feeds:** *For you* (everyone) and *Following* (people you follow plus yourself), with infinite scroll.
- **Posts:** text up to 280 characters and/or a photo, a live character counter, ⌘/Ctrl+Enter to post, **edit** with an "edited" label, and delete.
- **#hashtags, @mentions and links** are clickable everywhere, including Hindi and other non-Latin tags. Each tag has its own page at `/tags/<tag>`.
- **Trending:** the most-used hashtags from the last 7 days, cached for 5 minutes.
- **Post pages:** `/post/<id>` with a shareable link, link-preview metadata and the full reply thread. **Share** uses the native share sheet or copies the link.
- **Replies:** loaded when opened. Authors can delete their own replies, and post owners can moderate their threads.
- **Likes and bookmarks:** update instantly and roll back if the server rejects the change.
- **Follow system** with "Follows you" badges and suggestions on who to follow.
- **Search:** live people suggestions as you type. Full results for posts and people on `/explore`, and `#tag` searches jump straight to the tag page.
- **Notifications:** for likes, replies and follows, with an unread badge in the nav that clears when you open the page. Unliking or unfollowing removes the matching notification, so toggling doesn't spam people.
- **Profiles:** Posts / Media / Likes tabs, cover photo upload, and editable bio, location and website.
- **Look and feel:** light and dark themes, a responsive three-column layout with a bottom tab bar on phones, keyboard-accessible menus, and reduced-motion support.

## Engineering notes

- **Server actions return `{ success, data | error }`** (`src/lib/action.ts`). Expected problems such as validation errors or missing permissions reach the user as plain messages. Unexpected errors are logged on the server and shown as a generic message.
- **Every write is validated with Zod** (`src/lib/validation.ts`). Post images must be HTTPS URLs from our upload hosts.
- **Authorization lives on the server:** only authors can edit or delete posts, and only comment or post owners can delete replies. Notifications can only be marked read by their owner.
- **One sign-in helper** (`src/lib/auth.ts`) creates the database user on first visit, handles username collisions, and is cached per request.
- **Efficient queries:** keyset pagination, and per-viewer like/bookmark lookups that read at most one row instead of every like on a post.
- **Rate limiting** on posting, replying, reactions and follows. It's in-memory per server instance: a speed bump against spam, not a hard quota.
- **Security headers**, an image host allowlist, and sign-in required for `/notifications` and `/bookmarks`.
- **Strict TypeScript and ESLint** run during `next build`.

## Getting started

```bash
git clone https://github.com/Raj4478/Socially.git
cd Socially
npm install
cp .env.example .env.local   # fill in the values
npx prisma db push           # create tables
npm run db:seed              # optional: demo users and posts
npm run dev
```

Then open http://localhost:3000.

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Any PostgreSQL database (Neon, Supabase, local) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk dashboard → API keys |
| `UPLOADTHING_TOKEN` | UploadThing dashboard → API keys |
| `NEXT_PUBLIC_SITE_URL` | Optional. Your deployed URL, used in link previews |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (type-checks and lints) |
| `npm run check` | Type-check, lint and unit tests |
| `npm test` | Vitest unit tests for parsing, validation, rate limiting and helpers |
| `npm run db:seed` | Demo data (refuses if posts exist; `-- --force` to reseed) |

## Structure

```
src/
├── actions/        # Server actions: posts, users, profiles, notifications
├── app/            # Routes: /, /explore, /tags/[tag], /post/[id], /profile/[username], /bookmarks, /notifications
├── components/
│   ├── shell/      # Side nav, mobile chrome, right rail, search, compose dialog
│   └── ui/         # shadcn/ui primitives
└── lib/            # auth, validation, content parsing, pagination, rate limiting, types
prisma/
├── schema.prisma
└── seed.mjs
```

## Author

**Rajeshwar Singh** · [GitHub @Raj4478](https://github.com/Raj4478)
