import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { TaskList } from "@/components/task-list";
import { ArrowLeft } from "lucide-react";
import { Task } from "@shared/schema";

export default function Backlog() {
  const { data: tasks, isLoading } = useQuery<Task[]>({ 
    queryKey: ["/api/backlog"]
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Backlog
          </h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : tasks?.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No tasks in backlog</h2>
            <p className="text-muted-foreground">
              Old tasks that you choose to keep will appear here.
            </p>
          </div>
        ) : (
          <TaskList tasks={tasks || []} showBacklogButton={false} />
        )}
      </div>
    </div>
  );
}
