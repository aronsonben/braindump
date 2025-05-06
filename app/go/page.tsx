import { cache } from 'react'
import { redirect } from "next/navigation";
import Home from "@/components/home";
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
    <main className="flex flex-col gap-8 p-4 justify-center items-center">
      <Home tasks={tasks} categories={categories} />
    </main>
  );
}
