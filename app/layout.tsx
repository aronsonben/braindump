import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ReminderSettings } from "@/components/reminder-settings";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarTrigger,
  SidebarClose
} from "@/components/ui/sidebar";
import { Archive, BrainCircuit, ChartScatterIcon, FolderOpen, Settings, X, Menu, Home, CheckSquare } from "lucide-react";
import HeaderAuth from "@/components/header-auth";
import Link from "next/link";
import NavBar from "@/components/navbar";
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
              <nav className="w-full flex justify-center bg-cream border-b border-b-foreground/10 h-16">
                <div className="w-full flex justify-between items-center p-3 px-10 text-sm">
                  <Sidebar>
                    <SidebarTrigger>
                      <Menu className="cursor-pointer h-6 w-6 text-muted-foreground hover:text-primary" />
                    </SidebarTrigger>
                    <SidebarContent>
                      <div className="w-full p-6 pb-1 flex justify-between items-center">
                        <SidebarTitle>braindump</SidebarTitle>
                        <SidebarClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                          <X className="h-4 w-4 cursor-pointer" />
                        </SidebarClose>
                      </div>
                      <div className="flex flex-col">
                        <Link href="/go">
                          <Button variant="ghost" className="w-full justify-start px-4 py-3 cursor-pointer rounded-none text-base font-normal hover:bg-accent border-t-1 border-t-black hover:bg-amber-400 transition-colors">
                            <Home className="h-5 w-5 mr-3" />
                            Home
                          </Button>
                        </Link>
                        <Link href="/braindump">
                          <Button variant="ghost" className="w-full justify-start px-4 py-3 cursor-pointer rounded-none text-base font-normal hover:bg-accent border-t-1 border-t-black hover:bg-amber-400 transition-colors">
                            <BrainCircuit className="h-5 w-5 mr-3" />
                            New Brain Dump
                          </Button>
                        </Link>
                        <Link href="/categories">
                          <Button variant="ghost" className="w-full justify-start px-4 py-3 cursor-pointer rounded-none text-base font-normal hover:bg-accent border-t-1 border-t-black hover:bg-amber-400 transition-colors">
                            <FolderOpen className="h-5 w-5 mr-3" />
                            Categories
                          </Button>
                        </Link>
                        <Link href="/priorities">
                          <Button variant="ghost" className="w-full justify-start px-4 py-3 cursor-pointer rounded-none text-base font-normal hover:bg-accent border-t-1 border-t-black hover:bg-amber-400 transition-colors">
                            <FolderOpen className="h-5 w-5 mr-3" />
                            Priorities
                          </Button>
                        </Link>
                        <Link href="/backlog">
                          <Button variant="ghost" className="w-full justify-start px-4 py-3 cursor-pointer rounded-none text-base font-normal hover:bg-accent border-t-1 border-t-black hover:bg-amber-400 transition-colors">
                            <Archive className="h-5 w-5 mr-3" />
                            Backlog
                          </Button>
                        </Link>
                        <Link href="/completed">
                          <Button variant="ghost" className="w-full justify-start px-4 py-3 cursor-pointer rounded-none text-base font-normal hover:bg-accent border-t-1 border-t-black hover:bg-amber-400 transition-colors">
                            <CheckSquare className="h-5 w-5 mr-3" />
                            Completed
                          </Button>
                        </Link>
                        <Link href="/matrix">
                          <Button variant="ghost" className="w-full justify-start px-4 py-3 cursor-pointer rounded-none text-base font-normal hover:bg-accent border-y-1 border-y-black hover:bg-amber-400 transition-colors">
                            <ChartScatterIcon className="h-5 w-5 mr-3" />
                            Matrix
                          </Button>
                        </Link>
                      </div>
                    </SidebarContent>
                  </Sidebar>
                  <div className="flex gap-4 items-center font-semibold">
                    <Link href={"/"}>🧠braindump💩</Link>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <ThemeSwitcher />
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
                </div>
              </nav>
              <div id="layout-container" className="flex-1 flex flex-col gap-20 w-full jutsify-center items-center bg-[#f9f5ed]">
                {children}
              </div>
              <footer id="footer" className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-2">
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
