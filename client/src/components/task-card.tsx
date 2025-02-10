import { Task, PriorityLevel } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { differenceInDays } from "date-fns";
import { Flag, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onPriorityChange: (id: number, priority: string) => void;
  onMoveToBacklog?: (id: number) => void;
  showAge?: boolean;
}

export function TaskCard({ task, onPriorityChange, onMoveToBacklog, showAge = true }: TaskCardProps) {
  const daysOld = differenceInDays(new Date(), new Date(task.createdAt));

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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case PriorityLevel.HIGH:
        return "High";
      case PriorityLevel.MEDIUM_HIGH:
        return "Medium-High";
      case PriorityLevel.MEDIUM:
        return "Medium";
      case PriorityLevel.MEDIUM_LOW:
        return "Medium-Low";
      case PriorityLevel.LOW:
        return "Low";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{task.title}</h3>
          {showAge && (
            <p className={`text-sm ${getAgeColor(daysOld)}`}>
              {daysOld} days old
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={getPriorityColor(task.priority)}
              >
                <Flag className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPriorityChange(task.id, PriorityLevel.HIGH)}>
                <Flag className="h-4 w-4 mr-2 text-red-500" />
                High Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityChange(task.id, PriorityLevel.MEDIUM_HIGH)}>
                <Flag className="h-4 w-4 mr-2 text-orange-500" />
                Medium-High Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityChange(task.id, PriorityLevel.MEDIUM)}>
                <Flag className="h-4 w-4 mr-2 text-yellow-500" />
                Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityChange(task.id, PriorityLevel.MEDIUM_LOW)}>
                <Flag className="h-4 w-4 mr-2 text-blue-500" />
                Medium-Low Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPriorityChange(task.id, PriorityLevel.LOW)}>
                <Flag className="h-4 w-4 mr-2 text-green-500" />
                Low Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {onMoveToBacklog && daysOld > 7 && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => onMoveToBacklog(task.id)}
            >
              <Archive className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}