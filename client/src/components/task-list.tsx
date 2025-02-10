import { Task } from "@shared/schema";
import { TaskCard } from "./task-card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TaskListProps {
  tasks: Task[];
  showAge?: boolean;
  showBacklogButton?: boolean;
}

export function TaskList({ tasks, showAge = true, showBacklogButton = true }: TaskListProps) {
  const { toast } = useToast();

  const handlePriorityChange = async (id: number, priority: number) => {
    try {
      await apiRequest("PATCH", `/api/tasks/${id}`, { priority });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    } catch (error) {
      toast({
        title: "Error updating priority",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleMoveToBacklog = async (id: number) => {
    try {
      await apiRequest("POST", `/api/tasks/${id}/backlog`);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task moved to backlog",
        description: "You can find it in the backlog page",
      });
    } catch (error) {
      toast({
        title: "Error moving task to backlog",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onPriorityChange={handlePriorityChange}
          onMoveToBacklog={showBacklogButton ? handleMoveToBacklog : undefined}
          showAge={showAge}
        />
      ))}
    </div>
  );
}
