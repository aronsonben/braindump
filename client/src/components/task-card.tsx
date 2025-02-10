import { Task } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { differenceInDays } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, Archive } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onPriorityChange: (id: number, priority: number) => void;
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPriorityChange(task.id, task.priority + 1)}
          >
            <ArrowUpCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPriorityChange(task.id, task.priority - 1)}
          >
            <ArrowDownCircle className="h-5 w-5" />
          </Button>
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