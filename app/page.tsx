import Link from "next/link";

export default function AppHome() {
  return (
    <>
      <main className="flex flex-col gap-8 p-4 justify-center items-center">
        <div className="flex flex-col justify-center items-center text-center gap-4">
          <h2 className="font-medium text-4xl">Braindump</h2>
          <p className="text-xs italic">track what{"'"}s important</p>
        </div>
        <div className="flex flex-col justify-start items-start gap-8">
          <p className="text-sm">Are you like me and spending more time organizing than doing? Do you {"'"}braindump{"'"} a list of tasks to do every day and then lose track of what{"'"}s truly important?</p>
          <p className="text-sm">This tool is for you! A work in progress. Sign up to try it out and let me know whatcha think!</p>
        </div>
        <div className="flex flex-col justify-start items-start gap-8">
          <Link href="/go">Go</Link>
        </div>
      </main>
    </>
  );
}
