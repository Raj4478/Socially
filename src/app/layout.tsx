import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/ui/Navbar";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Socially — Connect & Share",
  description: "A futuristic social platform to connect, share, and discover.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased font-sans">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="min-h-screen bg-background">
              <Navbar />
              <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 pt-14 pb-20 lg:pb-0">
                  <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
                    <Sidebar />
                  </aside>
                  <main className="col-span-1 lg:col-span-6 xl:col-span-7 border-x border-border/60 min-h-screen">
                    {children}
                  </main>
                  <aside className="hidden lg:block lg:col-span-3">
                    <RightPanel />
                  </aside>
                </div>
              </div>
            </div>
            <Toaster
              position="bottom-center"
              toastOptions={{
                duration: 2000,
                style: {
                  background: "var(--card)",
                  color: "var(--card-foreground)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  fontSize: "14px",
                  fontWeight: "500",
                  backdropFilter: "blur(12px)",
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
