import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/ui/Navbar";
import Sidebar from "@/components/Sidebar";
import RightPanel from "@/components/RightPanel";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Socially — Connect & Share",
  description: "A modern social platform to connect, share, and discover.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="min-h-screen bg-background">
              <Navbar />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 pt-14">
                  {/* Left sidebar */}
                  <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 pt-6">
                    <Sidebar />
                  </aside>
                  {/* Main feed */}
                  <main className="col-span-1 lg:col-span-6 xl:col-span-7 border-x border-border min-h-screen">
                    {children}
                  </main>
                  {/* Right panel */}
                  <aside className="hidden lg:block lg:col-span-3 pt-6">
                    <RightPanel />
                  </aside>
                </div>
              </div>
            </div>
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: "var(--card)",
                  color: "var(--card-foreground)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
