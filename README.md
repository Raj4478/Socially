<div align="center">

# ⚡ Socially

**A professional-grade full-stack social platform built with Next.js 15, Prisma, Framer Motion & Clerk.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-socially--hcia.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://socially-hcia.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js_15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer)

</div>

## ✨ Features

- 🔐 **Auth** — Clerk authentication (Google, GitHub, email)
- 📝 **Posts** — Create posts with images, 280-char counter
- ❤️ **Reactions** — Optimistic likes with particle burst animation
- 🔖 **Bookmarks** — Save posts for later
- 💬 **Comments** — Threaded replies with animated drawer
- 🔔 **Notifications** — Real-time like, comment, follow alerts
- 👥 **Follow system** — Follow/unfollow users
- 🔍 **Live Search** — Search users and posts with spring dropdown
- 🧭 **Explore** — Discover people and content
- 🌗 **Dark mode** — System-aware with animated toggle
- 📱 **Mobile-first** — Bottom nav, responsive 3-column layout
- 🎨 **Glassmorphism** — Blur + glow effects throughout
- ✨ **Framer Motion** — Page reveals, layoutId nav, particle effects

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Auth | Clerk |
| Database | PostgreSQL + Prisma ORM |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Animations | Framer Motion |
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
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
UPLOADTHING_TOKEN=...
```

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Structure

```
src/
├── app/
│   ├── page.tsx          # Home feed
│   ├── explore/          # Search & discover
│   ├── notifications/    # Activity
│   ├── bookmarks/        # Saved posts
│   ├── profile/[username]/
│   ├── error.tsx         # Error boundary
│   └── loading.tsx       # Skeleton loader
├── actions/              # Server actions
├── components/           # UI + animated components
└── lib/                  # Utilities
prisma/schema.prisma      # DB schema
```

## 🌐 Live Demo

**[socially-hcia.vercel.app](https://socially-hcia.vercel.app)**
