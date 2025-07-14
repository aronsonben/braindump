import { cache } from 'react'
import { redirect } from "next/navigation";
import Rank from "@/components/rank";
import { getUserData, getActiveTasks, getCategories, getPriorities } from "@/utils/supabase/fetchData";

const getActiveTasksCached = cache(getActiveTasks);
const getCategoriesCached = cache(getCategories);
const getPrioritiesCached = cache(getPriorities);

export default async function RankPage() {
  const user = await getUserData();
  const tasks = await getActiveTasksCached(user.id);
  const categories = await getCategoriesCached(user.id);
  const priorities = await getPrioritiesCached(user.id);

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
  if (!priorities) {
    console.log("Priorities not found");
  } 

  return (
    <Rank tasks={tasks} />
  );
}
