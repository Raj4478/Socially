<div align="center">
  <h1>⚡ Socially</h1>
  <p>A professional-grade full-stack social platform built with Next.js 15, Prisma, and Clerk.</p>

  ![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
  ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
</div>

## ✨ Features

- 🔐 **Auth** — Clerk authentication (Google, GitHub, email)
- 📝 **Posts** — Create posts with images, 280-char limit counter
- ❤️ **Reactions** — Optimistic like/unlike with animation
- 🔖 **Bookmarks** — Save posts for later
- 💬 **Comments** — Threaded reply system
- 🔔 **Notifications** — Real-time like, comment, follow alerts
- 👥 **Follow system** — Follow/unfollow with notification
- 🔍 **Search** — Live search for users and posts
- 🧭 **Explore** — Discover people and content
- 🌗 **Dark mode** — System-aware theme switching
- 📱 **Mobile-first** — Bottom nav, responsive 3-column layout

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Auth | Clerk |
| Database | PostgreSQL + Prisma ORM |
| Styling | Tailwind CSS v4 + shadcn/ui |
| File Upload | UploadThing |
| Deployment | Vercel |

## 🚀 Getting Started

```bash
git clone https://github.com/Raj4478/Socially.git
cd Socially
npm install
```

Create `.env.local`:
```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
UPLOADTHING_TOKEN=
```

```bash
npx prisma migrate dev
npm run dev
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Home feed
│   ├── explore/          # Search & discover
│   ├── notifications/    # Activity feed
│   ├── bookmarks/        # Saved posts
│   └── profile/[username]/
├── actions/              # Server actions (post, user, profile)
├── components/           # UI components
└── lib/                  # Utilities
prisma/schema.prisma      # Database schema
```
