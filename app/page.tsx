import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function AppHome() {
  return (
    <>
      <main className="flex flex-col gap-8 p-4 justify-center items-center max-w-[80vw]">
        <div className="flex flex-col justify-center items-center text-center gap-4">
          <h2 className="font-medium text-4xl">🧠braindump💩</h2>
          <p className="text-xs italic">track what{"'"}s important</p>
        </div>
        <div className="flex flex-col justify-center items-center sm:justify-start sm:items-start gap-8">
          <p className="text-[16px]">Do you spend more time organizing your to-do list than doing tasks?</p>
          <p className="text-[16px]">Do you often forget about important tasks?</p>
          <p className="text-[16px]">Are you constantly recreating to-do lists to remember what is top priority?</p>
        </div>
        <div className="flex flex-col justify-center items-center gap-8">
          <p className="text-center text-xl italic font-bold">Then 🧠braindump💩 is for you!</p>
        </div>
        <div className="flex flex-col justify-start items-start gap-8 p-4 rounded-md bg-[hsl(var(--card))] border border-grey-300">
          <p className="text-sm">
            🧠braindump💩 is a to-do list tool designed for people who want to spend more time doing than remembering what to do.
            Whether you are a busy professional, a hobbyist, student, or just someone who wants to get things done, this tool is for you.
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-4">
          <p className="text-2xl text-center font-bold">How it works</p>
          <div className="flex flex-col justify-center items-center gap-4 bg-[hsl(var(--card))] p-4 rounded-md border border-grey-100">
          <p className="">🧠braindump💩 is centered around the idea of, well, <i>"brain dumps"</i>.</p>
          <p className="">
            The idea is to get <i>dump</i> everything on your mind into one place. 
            Once everything is <i>flushed out</i>, you categorize and <b>prioritize</b> tasks into which are must-dos and which are only dreams for the future.
            After that, get off the site and get to work!
          </p>
          <ol>
            <li>1. Make an account</li>
            <li>2. Create a new braindump</li>
            <li>3. Organize your tasks with customizable categories and priorities</li>
            <li>4. Customize your settings to get reminders for tasks that are important to you</li>
            <li>5. Get things done!</li>
          </ol>
          <p className="text-sm">
            🧠braindump💩 is not a Jira ticket, Trello board, or advanced notetaking app - you've got your tools and you should use them (as do I!).
            Check in here every day or every so often, whichever works.
          </p>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-8">
          <p className="">
            This is a work in progress, so let me know whatcha think! Good luck and have fun!
          </p>
        </div>
        <div className="w-full flex flex-col justify-start items-start gap-8">
          <Link href="/go" className="w-full">
            <Button variant="outline" className="w-full flex items-center gap-2">Go</Button>
          </Link>
        </div>
      </main>
    </>
  );
}
