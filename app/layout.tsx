import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ReminderSettings } from "@/components/reminder-settings";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import HeaderAuth from "@/components/header-auth";
import Link from "next/link";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const defaultUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : "http://localhost:3000";

export const metadata: Metadata = {
  title: "🧠braindump💩",
  description: "keep track of what's important",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col justify-between items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-4 items-center font-semibold">
                    <Link href={"/"}>🧠braindump💩</Link>
                    <div className="flex items-center gap-2">
                      <ThemeSwitcher />
                    </div>
                  </div>
                  <ReminderSettings 
                    trigger={
                      <Button variant="ghost" size="icon" className="ml-2">
                        <Settings className="h-5 w-5 text-muted-foreground hover:text-primary" />
                      </Button>
                    }
                  />
                  <HeaderAuth />
                </div>
              </nav>
              <div className="flex-1 flex flex-col gap-20 max-w-5xl w-full jutsify-center items-center">
                {children}
              </div>
              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-2">
                <p>
                  another{" "}
                  <a
                    href="https://concourse.codes"
                    target="_blank"
                    className="font-bold hover:underline"
                    rel="noreferrer"
                  >
                    bo rice brainblast
                  </a>
                </p>
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
