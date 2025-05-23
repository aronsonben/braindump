import { use, cache } from 'react'
import { redirect } from "next/navigation";
import Link from 'next/link';
import Matrix from "@/components/matrix";
import { Toaster } from "@/components/ui/toaster";
import { differenceInDays } from "date-fns/differenceInDays";
import { getUserData, getActiveTasks, getCategories, getPriorities, getUserPreferences, getActiveTasksNeedingReminders } from "@/utils/supabase/fetchData";

interface ScatterPoint {

  x: number;
  y: number;
}

const getActiveTasksCached = cache(async (userId: string, sortBy: string = 'position') => {
  return getActiveTasks(userId, sortBy);
});
const getCategoriesCached = cache(getCategories);
const getPrioritiesCached = cache(getPriorities);
const getUserPreferencesCached = cache(getUserPreferences);
const getActiveTasksNeedingRemindersCached = cache(getActiveTasksNeedingReminders);

export default async function MatrixPage() {
  const user = await getUserData();
  if (!user) {
    console.log("[MatrixPage] User not found");
    return redirect("/sign-in");
  } 

  const tasks = await getActiveTasksCached(user.id);
  if (!tasks) {
    console.log("Tasks not found");
    throw new Error("Tasks not found");
  } 

  const categories = await getCategoriesCached(user.id);
  const priorities = await getPrioritiesCached(user.id);
  
  
  if (!categories) {
    console.log("Categories not found");
  } 
  if (!priorities) {
    console.log("Priorities not found");
  } else {
    console.log("Found priorities: ", priorities);
  }

  console.log("[MatrixPage] Rendering Tasks: ", tasks);

  // Calculate mean age (days old) for all tasks
  const allAges = tasks.map((task) =>
    Math.floor((new Date().getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))
  );
  const meanAge = allAges.length > 0 ? allAges.reduce((a, b) => a + b, 0) / allAges.length : 0;

  // Group tasks by priority for chartData
  const chartData = priorities.map((priority) => {
    const color = priority.color || "#000000";
    const tasksForPriority = tasks.filter((task) => task.priority === priority.id);
    return {
      label: priority.name, // Priority name as dataset label
      backgroundColor: color,
      data: tasksForPriority.map((task) => ({
        x: priority.order || 0,
        y: Math.floor((new Date().getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        title: task.title, // Attach task title for tooltip
      })),
    };
  }).filter(ds => ds.data.length > 0); // Only include priorities with tasks

  // Pass meanAge to Matrix for quadrant plugin
  return (
    <>
    <main className="flex flex-col gap-4 p-4 justify-center items-center">
      <Matrix 
        chartData={chartData}
        meanAge={meanAge}
      />
    </main>
    <Toaster />
    </>
  );
}
