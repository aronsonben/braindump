import { cache } from 'react'
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/task-list";
import { ArrowLeft } from "lucide-react";
import { Task, Category } from "@/lib/interface";
import { getUserData, getTasks, getCategories } from "@/utils/supabase/fetchData";

const getTasksCached = cache(getTasks);
const getCategoriesCached = cache(getCategories);

export default async function Backlog() {
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

  // Filter tasks to only show those in the backlog
  const backlogTasks = tasks.filter((task) => task.in_backlog);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/go">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground bg-clip-text">
            Backlog
          </h1>
        </div>

        {tasks?.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No tasks in backlog</h2>
            <p className="text-muted-foreground">
              Old tasks that you choose to keep will appear here.
            </p>
          </div>
        ) : (
          <TaskList 
            tasks={backlogTasks || []} 
            categories={categories} 
            showBacklogButton={false} 
            showResumeButton={true} 
          />
        )}
      </div>
    </div>
  );
}
