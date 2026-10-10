import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import LeftNav from "@/components/shell/LeftNav";
import RightRail from "@/components/shell/RightRail";
import MobileChrome from "@/components/shell/MobileChrome";

// Every page depends on who is signed in, so nothing is prerendered at build time.
export const dynamic = "force-dynamic";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://socially-hcia.vercel.app";
const DESCRIPTION = "Share what's on your mind, follow people you care about and join conversations around #topics.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Socially", template: "%s · Socially" },
  description: DESCRIPTION,
  applicationName: "Socially",
  authors: [{ name: "Rajeshwar Singh", url: "https://github.com/Raj4478" }],
  openGraph: { type: "website", siteName: "Socially", title: "Socially", description: DESCRIPTION, url: SITE_URL },
  twitter: { card: "summary", title: "Socially", description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <body className="font-sans">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:shadow">
              Skip to content
            </a>
            <MobileChrome />
            <div className="mx-auto flex max-w-7xl justify-center px-0 sm:px-4">
              <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
                <LeftNav />
              </aside>
              <main id="main" className="min-h-screen w-full max-w-[600px] border-x pb-16 pt-14 lg:pb-0 lg:pt-0">
                {children}
              </main>
              <aside className="hidden w-80 shrink-0 pl-6 xl:block">
                <RightRail />
              </aside>
            </div>
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 2500,
                className: "!bg-foreground !text-background !text-sm !rounded-lg !shadow-lg",
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
