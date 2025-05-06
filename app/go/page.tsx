import { cache } from 'react'
import { redirect } from "next/navigation";
import Link from 'next/link';
import Home from "@/components/home";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { BrainCircuit, FolderOpen, Archive } from "lucide-react";
import { getUserData, getTasks, getCategories } from "@/utils/supabase/fetchData";

const getTasksCached = cache(getTasks);
const getCategoriesCached = cache(getCategories);

// Learning: considering using parallel data fetching per Next.js docs
/**
async function getTasksParallel(userId: string) {
  const tasks = await getTasks(userId);
  return tasks;
}
async function getCategoriesParallel(userId: string) {
  const categories = await getCategories(userId);
  return categories;
}
*/

export default async function Go() {
  const user = await getUserData();
  const tasks = await getTasksCached(user.id);
  const categories = await getCategoriesCached(user.id);

  if (!user) {
    console.log("User not found");
    return redirect("/");
  } 
  if (!tasks) {
    console.log("Tasks not found");
  } 
  if (!categories) {
    console.log("Categories not found");
  } 

  return (
    <>
    <main className="flex flex-col gap-4 p-4 justify-center items-center">
      <div className="flex gap-4">
        <Link href="/braindump">
          <Button variant="outline"  className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            New Brain Dump
          </Button>
        </Link>
        <Link href="/categories">
          <Button variant="outline" className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Categories
          </Button>
        </Link>
        <Link href="/backlog">
          <Button variant="outline" className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Backlog
          </Button>
        </Link>
      </div>
      <Home tasks={tasks} categories={categories} />
    </main>
    <Toaster />
    </>
  );
}
