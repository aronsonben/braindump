"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TaskList } from "@/components/task-list";
import { Task, Category } from "@/lib/interface";

interface HomeProps {
  tasks: Task[];
  categories: Category[];
}

export default function Home({ tasks, categories }: HomeProps) {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        {tasks?.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No tasks yet!</h2>
            <p className="text-muted-foreground mb-8">
              Start by creating a new brain dump to add some tasks.
            </p>
            <Link href="/brain-dump">
              <Button>Create Brain Dump</Button>
            </Link>
          </div>
        ) : (
          <TaskList 
            tasks={tasks || []} 
            categories={categories}
          />
        )}
      </div>
      <div className="flex flex-col justify-start items-start gap-8">
        <Link href="/">Home</Link>
      </div>
    </div>
  );
}
