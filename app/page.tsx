import Link from "next/link";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function AppHome() {
  return (
    <>
      <main className="flex flex-col gap-8 p-4 justify-center items-center max-w-[60vw] bg-[#d1b597]">
        <div className="flex flex-col gap-8 p-4 justify-center items-center max-w-[60vw] bg-[hsl(var(--card))] m-6 rounded-3xl">
          <div className="w-full flex flex-col justify-center items-center text-center gap-4 h-[20vh] bg-[#d1b597] shadow-xl rounded-3xl">
            <h2 className="font-medium text-4xl">🧠braindump💩</h2>
            <p className="text-xs italic">track what{"'"}s important</p>
          </div>
          <div className="flex flex-col justify-start items-start gap-8 p-4 rounded-md bg-[hsl(var(--card))]">
            <p className="text-[14px]">
              <b>Do you spend more time organization your to-do list than actually doing tasks?</b><br />
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
            <h3 className="text-2xl">What Is Braindump?</h3>
            <p className="text-[14px]">
              <b>🧠braindump💩</b> is an opinionated task tracking tool designed around the process of "braindumping" all the tasks, thoughts, and ideas in your head down in one place.
              It is especially helpful, but not exclusively, for people with ADHD.
            </p>
            <p className="text-[14px]">
              It behaves the same as a typical task tracking tool but is especially helpful for people who find themselves struggling between new tasks and old ones.
              The three primary benefits to 🧠braindump💩 are: 
            </p>
            <ol className="w-full flex flex-col justify-start text-left pl-6 text-[14px]" style={{"listStyle": "revert"}}>
              <li>Task Ranking Scores<sup>*</sup></li>
              <li>Long-term Task Deferral<sup>*</sup></li>
              <li>Annoying Task Reminders<sup>*</sup></li>
            </ol>
            <p className="text-[12px] italic mt-[-10px]"><sup>*</sup> All features are works in progress</p>
            <div className="flex flex-col gap-4">
              <h4 className="text-[18px] font-bold">Task Ranking Scores</h4>
              <p className="text-[14px]">
                For those of us who are easily distracted by new & shiny ideas or put off larger tasks until last minute,
                it can be especially difficult to truly see through the mist in identifying which tasks are important to get done.
              </p>
              <p className="text-[14px]">
                By ranking these tasks over time, then comparing to their priority level, we can arrive at a "score" that reflects how
                important this task has been to the user each time they came to re-organize their tasks. 
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[18px] font-bold">Long-Term Task Deferrals</h4>
              <p className="text-[14px]">
                For creatives, entrepreneurs, and many others the world can be seen as overflowing with new opportunities and ideas.
                Some of these ideas grasp us and bring us to actions, others clutter our pages and apps with what can feel like missed opportunities.
              </p>
              <p className="text-[14px]">
                In 🧠braindump💩, tasks that sit too long at a low priority are automatically suggested to be moved to the <i>backlog.</i>
                Users can control these settings, but the idea is to remove faraway ideas from your present tasks and responsibilities.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-[18px] font-bold">Annoying Task Reminders</h4>
              <p className="text-[14px]">
                🧠braindump💩 is designed to be a bit annoying in the way it handles reminders. 
                While this might not suit everyone, oftentimes people with ADHD or similar brains will allow dealines for important responsibilities
                come and go simply out of procrastination or deference for more interesting tasks.  
              </p>
              <p className="text-[14px]">
                By default, task reminders for the most important tasks are set to be a nuisance. Users may change this in the settings,
                but by insisting upon user action for extremely high-importance task, the hope is to avoid serious consequences for 
                missing the most important tasks. 
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-8 p-4 rounded-md bg-[hsl(var(--card))]">
            <h3 className="text-2xl">A Work In Progress</h3>
            <p className="text-[14px]">
              <a href="https://concourse.codes">Hey, I'm Ben.</a> I'm working on <b>🧠braindump💩</b> as a passion project 
              (which I have, ironically, been able to prioritize long enough to actually make it a thing).
            </p>
            <p className="text-[14px]">
              There may be bugs, incomplete features, or otherwise annoying facets of a concept that has been 
              created and perfected a hundred times over. I ask for your patience and understanding! 
              <br />
              Please feel free to <a href="https://concourse.codes/contact">contact me with any questions or feedback you have.</a>
            </p>
            <p className="text-[14px]">
              If the tool seems helpful to you, I am <a href="https://github.com/aronsonben">developing it publicly and the code is posted on GitHub.</a> Get in touch if you'd like
              to join in, or even just have a chat about it. Thank you for your time and interest.
            </p>
          </div>
          <div className="w-full flex flex-col justify-start items-start gap-8">
            <Link href="/go" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2">Go</Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
