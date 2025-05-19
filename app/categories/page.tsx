import { cache } from 'react'
import { redirect } from "next/navigation";
import Categories from "@/components/categories";
import { getUserData, getActiveTasks, getCategories } from "@/utils/supabase/fetchData";

const getActiveTasksCached = cache(getActiveTasks);
const getCategoriesCached = cache(getCategories);

export default async function CategoriesPage() {
  const user = await getUserData();
  const tasks = await getActiveTasksCached(user.id);
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
    <Categories categories={categories} />
  );
}
