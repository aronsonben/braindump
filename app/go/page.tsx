import { use, cache } from 'react'
import { redirect } from "next/navigation";
import Link from 'next/link';
import Home from "@/components/home";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { BrainCircuit, FolderOpen, Archive, ChartScatterIcon } from "lucide-react";
import { getUserData, getActiveTasks, getCategories, getPriorities, getUserPreferences, getActiveTasksNeedingReminders } from "@/utils/supabase/fetchData";

const getActiveTasksCached = cache(async (userId: string, sortBy: string = 'position') => {
  return getActiveTasks(userId, sortBy);
});
const getCategoriesCached = cache(getCategories);
const getPrioritiesCached = cache(getPriorities);
const getUserPreferencesCached = cache(getUserPreferences);
const getActiveTasksNeedingRemindersCached = cache(getActiveTasksNeedingReminders);


// Learning: considering using parallel data fetching per Next.js docs
/**
async function getActiveTasksParallel(userId: string) {
  const tasks = await getActiveTasks(userId);
  return tasks;
}
async function getCategoriesParallel(userId: string) {
  const categories = await getCategories(userId);
  return categories;
}
*/

export default async function Go() {
  const user = await getUserData();
  if (!user) {
    console.log("Go: User not found");
    return redirect("/sign-in");
  } 

  // Get sort preference from query params or default to position
  // const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort : 'position';
  const sortBy = 'position';
  
  const tasks = await getActiveTasksCached(user.id, sortBy);
  const categories = await getCategoriesCached(user.id);
  const priorities = await getPrioritiesCached(user.id);
  const preferences = await getUserPreferencesCached(user.id);
  const tasksNeedingReminders = await getActiveTasksNeedingRemindersCached(user.id);
  
  if (!tasks) {
    console.log("Tasks not found");
  } 
  if (!categories) {
    console.log("Categories not found");
  } 
  if (!priorities) {
    console.log("Priorities not found");
  }
  if (!preferences) {
    console.log("Preferences not found");
  } 

  const showReminders = preferences?.enable_reminders;
  
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
        <Link href="/priorities">
          <Button variant="outline" className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Priorities
          </Button>
        </Link>
        <Link href="/backlog">
          <Button variant="outline" className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Backlog
          </Button>
        </Link>
        <Link href="/matrix">
          <Button variant="outline" className="flex items-center gap-2">
            <ChartScatterIcon className="h-5 w-5" />
            Matrix
          </Button>
        </Link>
      </div>
      <Home 
        tasks={tasks} 
        categories={categories} 
        priorities={priorities}
        tasksNeedingReminders={tasksNeedingReminders} 
      />
    </main>
    <Toaster />
    </>
  );
}
