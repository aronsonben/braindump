import Braindump from "@/components/braindump";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { getUserData } from "@/utils/supabase/fetchData";
import { SimpleUser } from "@/lib/interface";

export default async function AppHome() {
  const user = (await getUserData()) as SimpleUser;

  return (
    <>
      <main className="flex flex-col gap-8 p-4 justify-center items-center max-w-[60vw] ">
        <h2 className="font-medium text-4xl mt-4">🧠braindump💩</h2>
        <Braindump user={user} />
        <div className="flex flex-col gap-8 p-4 justify-center items-center max-w-[60vw] bg-[hsl(var(--card))] m-6 rounded-3xl">
          <div className="w-full flex flex-col justify-center items-center text-center gap-4 h-[20vh] bg-[#d1b597] shadow-xl rounded-3xl">
            <h2 className="font-medium text-4xl">🧠braindump💩</h2>
            <p className="text-xs italic">track what{"'"}s important</p>
          </div>
          <div className="flex flex-col justify-start items-start gap-8 p-4 rounded-md bg-[hsl(var(--card))]">
            <p className="text-[14px]">
              <b>Do you spend more time organizing your to-do list than actually doing tasks?</b><br />
              Do you often forget about important tasks?<br />
              Are you constantly recreating to-do lists to remember?<br />
              <p className="text-center text-[16px] m-4 font-bold">Then 🧠braindump💩 is for you!</p>
              <div className="w-[60%] flex flex-col justify-start items-start mx-auto pt-4">
                <Link href="/go" className="w-full cursor-pointer">
                  <Button variant="outline" className="w-full flex items-center gap-2 cursor-pointer hover:bg-amber-300">Go</Button>
                </Link>
              </div>
            </p>
          </div>
          <hr className="w-[80%] h-[1px] bg-gray-100 opacity-20" />
          <div className="flex flex-col justify-start items-start gap-8 p-4 rounded-md bg-[hsl(var(--card))]">
            <p className="text-[14px]">
              Read more about this project and its features on the <Link href="/about" className="text-blue-500 hover:underline">About</Link> page.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
