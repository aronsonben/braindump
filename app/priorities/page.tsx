import { cache } from 'react'
import { redirect } from "next/navigation";
import Priorities from "@/components/priorities";
import { getUserData, getActiveTasks, getPriorities } from "@/utils/supabase/fetchData";

const getActiveTasksCached = cache(getActiveTasks);
const getPrioritiesCached = cache(getPriorities);

export default async function PrioritiesPage() {
  const user = await getUserData();
  const priorities = await getPrioritiesCached(user.id);

  if (!user) {
    console.log("User not found");
    return redirect("/");
  } 
  if (!priorities) {
    console.log("Categories not found");
  } 

  return (
    <Priorities priorities={priorities} />
  );
}
