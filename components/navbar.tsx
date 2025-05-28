"use client";

import { useState } from "react";
import HeaderAuth from "@/components/header-auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Sidebar } from "@/components/ui/sidebar";
import { ReminderSettings } from "@/components/reminder-settings";
import { Settings } from "lucide-react";
import { HamburgerIcon } from "lucide-react";


export default function NavBar() {
  const [open, setOpen] = useState(false);
  const toggleSidebar = () => setOpen(!open);

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <Sidebar>
          <HamburgerIcon className="h-6 w-6 text-muted-foreground hover:text-primary" />
        </Sidebar>
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
  )
}