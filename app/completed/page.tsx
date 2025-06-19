import { cache } from 'react'
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/task-list";
import { ArrowLeft } from "lucide-react";
import { Task, Category } from "@/lib/interface";
import { getUserData, getCompletedTasks, getCategories, getPriorities } from "@/utils/supabase/fetchData";

const getCompletedTasksCached = cache(getCompletedTasks);
const getCategoriesCached = cache(getCategories);
const getPrioritiesCached = cache(getPriorities);

export default async function Completed() {
  const user = await getUserData();
  if (!user) {
    console.log("User not found");
    return redirect("/");
  } 

  const tasks = await getCompletedTasksCached(user.id);
  const categories = await getCategoriesCached(user.id);
  const priorities = await getPrioritiesCached(user.id);
  if (!tasks) {
    console.log("Tasks not found");
  } 
  if (!categories) {
    console.log("Categories not found");
  } 

  return (
    <div className="w-full bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/go">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground bg-clip-text">
            Completed
          </h1>
        </div>
        <div className="container mx-auto px-4 py-4">
          {tasks?.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No tasks in backlog</h2>
              <p className="text-muted-foreground">
                Old tasks that you choose to keep will appear here.
              </p>
            </div>
          ) : (
            <TaskList 
              tasks={tasks} 
              categories={categories} 
              priorities={priorities}
              showBacklogButton={false} 
              showResumeButton={true} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
