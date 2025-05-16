"use client";

import { useState, useEffect } from "react";
import { Task, PriorityLevel } from "@/lib/interface";
import { differenceInDays } from "date-fns";
import { Flag, Archive, CheckCircle2 } from "lucide-react";
import { markTaskAsReminded, changePriority, moveToBacklog } from "@/actions/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface TaskReminderDialogProps {
  open: boolean;
  taskList: Task[];
  onOpenChange: (open: boolean) => void;
}

export function TaskReminderDialog({ open, taskList, onOpenChange }: TaskReminderDialogProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [tasksLeft, setTasksLeft] = useState(taskList.length);
  const { toast } = useToast();


  console.log("TaskReminderDialog: taskList", taskList);
  

  // Reset index when dialog opens or taskList change
  // useEffect(() => {
  //   if (open) {
  //     setCurrentTaskIndex(0);
  //   }
  // }, [open, taskList]);

  const currentTask = taskList[currentTaskIndex];
  const hasMoreTasks = tasksLeft > 1;

  const handleNextTask = () => {
    if (hasMoreTasks) {
      console.log("There ar emore tasks still")
      const nextIndex = currentTaskIndex == taskList.length - 1 ? 0 : currentTaskIndex + 1;
      setCurrentTaskIndex(nextIndex);
      onOpenChange(true);
    } 
    // else {
    //   onOpenChange(false);
    // }
  };

  const handleCompleteNow = async () => {
    if (!currentTask) return;
    
    try {
      // Mark task as reminded
      await markTaskAsReminded(currentTask.id);
      
      // Decrease the number of tasks left
      setTasksLeft(prev => prev - 1);

      // Move to next task or close dialog
      handleNextTask();
      
      // Show toast
      toast({
        title: "Task reminder",
        description: "You'll complete this task now",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark task as reminded",
        variant: "destructive",
      });
    }
  };

  const handleLowerPriority = async () => {
    if (!currentTask) return;
    
    try {
      // Get the next lower priority level
      let newPriority: string;
      
      switch (currentTask.priority) {
        case PriorityLevel.HIGH:
          newPriority = PriorityLevel.MEDIUM_HIGH;
          break;
        case PriorityLevel.MEDIUM_HIGH:
          newPriority = PriorityLevel.MEDIUM;
          break;
        case PriorityLevel.MEDIUM:
          newPriority = PriorityLevel.MEDIUM_LOW;
          break;
        case PriorityLevel.MEDIUM_LOW:
          newPriority = PriorityLevel.LOW;
          break;
        default:
          newPriority = PriorityLevel.LOW;
      }
      
      // Change priority and mark as reminded
      await changePriority(currentTask.id, newPriority);
      await markTaskAsReminded(currentTask.id);
      
      toast({
        title: "Priority lowered",
        description: "Task priority has been reduced",
      });
      
      // Move to next task or close dialog
      handleNextTask();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to lower task priority",
        variant: "destructive",
      });
    }
  };

  const handleMoveToBacklog = async () => {
    if (!currentTask) return;
    
    try {
      // Move to backlog and mark as reminded
      await moveToBacklog(currentTask.id);
      await markTaskAsReminded(currentTask.id);
      
      toast({
        title: "Moved to backlog",
        description: "Task has been moved to the backlog",
      });
      
      // Move to next task or close dialog
      handleNextTask();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move task to backlog",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = async () => {
    if (!currentTask) return;
    
    try {
      // Just mark as reminded without other actions
      await markTaskAsReminded(currentTask.id);

      toast({
        title: "Reminder dismissed",
        description: "You'll be reminded again later",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss reminder",
        variant: "destructive",
      });
    }
          
    // Move to next task or close dialog
    handleNextTask();
    
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

  // if (!currentTask) {
  //   return (
  //     <AlertDialog open={open} onOpenChange={onOpenChange}>
  //       <AlertDialogContent>
  //         <AlertDialogHeader>
  //           <AlertDialogTitle>Task Reminder</AlertDialogTitle>
  //           <AlertDialogDescription>
  //             Loading taskList that need attention...
  //           </AlertDialogDescription>
  //         </AlertDialogHeader>
  //       </AlertDialogContent>
  //     </AlertDialog>
  //   );
  // }

  if (taskList.length === 0) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No Tasks Need Attention</AlertDialogTitle>
            <AlertDialogDescription>
              You're all caught up! There are no taskList that need your attention right now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Dismiss</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const daysOld = differenceInDays(new Date(), new Date(currentTask.created_at));

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <span>Task Reminder</span>
            <span onClick={() => onOpenChange(false)} className="cursor-pointer underline">X</span>  
          </AlertDialogTitle>
          <AlertDialogDescription>
            This task has been on your list for {daysOld} days. Do you still want to complete it?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* Task card */}
        <div className="w-full max-w-xl py-4">
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">{currentTask.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">Priority:</span>
              <span className={`font-medium ${getPriorityColor(currentTask.priority)}`}>
                <Flag className="h-4 w-4 inline-block mr-1" />
                {currentTask.priority}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Added {daysOld} days ago
            </div>
          </div>
          
          {/* total tasks to remind about */}
          <div className="flex max-w-xl text-sm text-gray-500 mb-2">
            {taskList.length > 1 && (
              <Badge variant="outline" className="mb-2">
                {currentTaskIndex + 1} of {taskList.length} taskList
              </Badge>
            )}
            {/* arrows to let user navigate through tasks that require reminding */}
            <div className=" ml-2">
            {hasMoreTasks ? (
              <>
                <span className={`text-gray-500 ${currentTaskIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <span
                    className="cursor-pointer"
                    onClick={currentTaskIndex === 0 ? undefined : handleNextTask}
                    tabIndex={currentTaskIndex === 0 ? -1 : 0}
                    aria-disabled={currentTaskIndex === 0}
                  >
                    {' ← '}
                  </span>
                </span>
                <span className={`text-gray-500 ${currentTaskIndex === taskList.length - 1 ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <span
                    className="cursor-pointer"
                    onClick={currentTaskIndex === taskList.length - 1 ? undefined : handleNextTask}
                    tabIndex={currentTaskIndex === taskList.length - 1 ? -1 : 0}
                    aria-disabled={currentTaskIndex === taskList.length - 1}
                  >
                    {' → '}
                  </span>
                </span>
              </>
            ) : (
              <span className="text-gray-500">
                No more tasks needing reminders.
              </span>
            )}
            </div>
          </div>
        </div>
        
        <AlertDialogFooter className="flex flex-col sm:flex-col sm:justify-between sm:flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 border-black"
            onClick={handleCompleteNow}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            I'll do it now
          </Button>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
            <Button 
              variant="outline" 
              className="w-full bg-[#b57d72] hover:bg-[#93331f] text-white"
              onClick={handleLowerPriority}
            >
              <Flag className="h-4 w-4 mr-2" />
              Lower priority
            </Button>
            <Button 
              variant="outline" 
              className="w-full hover:bg-[#7f708e] hover:text-white"
              onClick={handleMoveToBacklog}
            >
              <Archive className="h-4 w-4 mr-2" />
              Move to backlog
            </Button>
          </div>
          <AlertDialogCancel onClick={handleDismiss} className="bg-red-900 text-white hover:bg-red-800">
            Remind me later
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
