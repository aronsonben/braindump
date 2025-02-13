import { Task, PriorityLevel } from "@shared/schema";
import { differenceInDays } from "date-fns";
import { Flag, Archive, ChevronDown, FolderOpen, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

interface TaskListProps {
  tasks: Task[];
  showAge?: boolean;
  showBacklogButton?: boolean;
}

export function TaskList({ tasks, showAge = true, showBacklogButton = true }: TaskListProps) {
  const { toast } = useToast();
  const { data: categories } = useQuery({ queryKey: ["/api/categories"] });

  const getAgeColor = (days: number) => {
    if (days <= 3) return "text-green-600";
    if (days <= 7) return "text-yellow-600";
    return "text-red-600";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case PriorityLevel.HIGH:
        return "text-red-500";
      case PriorityLevel.MEDIUM_HIGH:
        return "text-orange-500";
      case PriorityLevel.MEDIUM:
        return "text-yellow-500";
      case PriorityLevel.MEDIUM_LOW:
        return "text-blue-500";
      case PriorityLevel.LOW:
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const handlePriorityChange = async (id: number, priority: string) => {
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

  const handleCategoryChange = async (taskId: number, categoryId: number | null) => {
    try {
      await apiRequest("PATCH", `/api/tasks/${taskId}`, { categoryId });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Category updated",
        description: "Task category has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error updating category",
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

  const handleDeleteTask = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/tasks/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Task has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error deleting task",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-900">Task</TableHead>
            {showAge && <TableHead className="font-semibold text-gray-900">Age</TableHead>}
            <TableHead className="font-semibold text-gray-900">Category</TableHead>
            <TableHead className="font-semibold text-gray-900">Priority</TableHead>
            <TableHead className="font-semibold text-gray-900 w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const daysOld = differenceInDays(new Date(), new Date(task.createdAt));
            const taskCategory = categories?.find(c => c.id === task.categoryId);

            return (
              <TableRow key={task.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-gray-900">{task.title}</TableCell>
                {showAge && (
                  <TableCell className={`${getAgeColor(daysOld)} font-medium`}>
                    {daysOld} days
                  </TableCell>
                )}
                <TableCell>
                  {taskCategory ? (
                    <Badge
                      variant="secondary"
                      style={{
                        backgroundColor: taskCategory.color,
                        color: 'white',
                        fontWeight: 'medium'
                      }}
                    >
                      {taskCategory.name}
                    </Badge>
                  ) : (
                    <span className="text-gray-500 text-sm">No category</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className={`font-medium ${getPriorityColor(task.priority)}`}>
                    <Flag className="h-4 w-4 inline-block mr-1" />
                    {task.priority}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {showBacklogButton && daysOld > 7 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMoveToBacklog(task.id)}
                        className="text-gray-700 hover:bg-gray-100"
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Backlog
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePriorityChange(task.id, PriorityLevel.HIGH)}>
                          <Flag className="h-4 w-4 mr-2 text-red-500" />
                          High Priority
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePriorityChange(task.id, PriorityLevel.MEDIUM_HIGH)}>
                          <Flag className="h-4 w-4 mr-2 text-orange-500" />
                          Medium-High Priority
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePriorityChange(task.id, PriorityLevel.MEDIUM)}>
                          <Flag className="h-4 w-4 mr-2 text-yellow-500" />
                          Medium Priority
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePriorityChange(task.id, PriorityLevel.MEDIUM_LOW)}>
                          <Flag className="h-4 w-4 mr-2 text-blue-500" />
                          Medium-Low Priority
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePriorityChange(task.id, PriorityLevel.LOW)}>
                          <Flag className="h-4 w-4 mr-2 text-green-500" />
                          Low Priority
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleCategoryChange(task.id, null)}>
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Remove Category
                        </DropdownMenuItem>
                        {categories?.map((category) => (
                          <DropdownMenuItem
                            key={category.id}
                            onClick={() => handleCategoryChange(task.id, category.id)}
                          >
                            <div
                              className="h-4 w-4 mr-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}