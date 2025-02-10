import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { TaskList } from "@/components/task-list";
import { BrainCircuit, Archive } from "lucide-react";
import { Task } from "@shared/schema";

export default function Home() {
  const { data: tasks, isLoading } = useQuery<Task[]>({ 
    queryKey: ["/api/tasks"]
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Task Manager
          </h1>
          <div className="flex gap-4">
            <Link href="/brain-dump">
              <Button className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                New Brain Dump
              </Button>
            </Link>
            <Link href="/backlog">
              <Button variant="outline" className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Backlog
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : tasks?.length === 0 ? (
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
          <TaskList tasks={tasks || []} />
        )}
      </div>
    </div>
  );
}
