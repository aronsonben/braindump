import Image from "next/image";
import Link from "next/link";

export default function Go() {
  return (
    <>
      <main className="flex flex-col gap-8 p-4 justify-center items-center">
        <div className="flex flex-col justify-center items-center text-center gap-4">
          <h2 className="font-medium text-4xl">Go</h2>
          <p className="text-xs italic">track what's important</p>
        </div>
        <div className="flex flex-col justify-start items-start gap-8">
          <Link href="/">Home</Link>
        </div>
      </main>
    </>
  );
}
