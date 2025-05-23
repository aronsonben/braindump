"use client";

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
        <div className="flex flex-col justify-start items-start gap-8">
          <p className="">
            Whoops! You hit a snag. Head back home or let me know what what wrong.
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
