import { use, cache } from 'react'
import { redirect } from "next/navigation";
import Link from 'next/link';
import Home from "@/components/home";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { BrainCircuit, FolderOpen, Archive } from "lucide-react";
import { getUserData, getTasks, getCategories, getUserPreferences, getTasksNeedingReminders } from "@/utils/supabase/fetchData";

const getTasksCached = cache(async (userId: string, sortBy: string = 'position') => {
  return getTasks(userId, sortBy);
});
const getCategoriesCached = cache(getCategories);
const getUserPreferencesCached = cache(getUserPreferences);
const getTasksNeedingRemindersCached = cache(getTasksNeedingReminders);


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
  if (!user) {
    console.log("Go: User not found");
    return redirect("/sign-in");
  } 

  // Get sort preference from query params or default to position
  // const sortBy = typeof searchParams.sort === 'string' ? searchParams.sort : 'position';
  const sortBy = 'position';
  
  const tasks = await getTasksCached(user.id, sortBy);
  const categories = await getCategoriesCached(user.id);
  const preferences = await getUserPreferencesCached(user.id);
  const tasksNeedingReminders = await getTasksNeedingRemindersCached(user.id);
  
  if (!tasks) {
    console.log("Tasks not found");
  } 
  if (!categories) {
    console.log("Categories not found");
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
        <Link href="/backlog">
          <Button variant="outline" className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Backlog
          </Button>
        </Link>
      </div>
      <Home 
        tasks={tasks} 
        categories={categories} 
        tasksNeedingReminders={tasksNeedingReminders} 
      />
    </main>
    <Toaster />
    </>
  );
}
