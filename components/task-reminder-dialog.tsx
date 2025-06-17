"use client";

import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { Flag, Archive, CheckCircle2, MoveRight, MoveLeft, XCircle } from "lucide-react";
import { markTaskAsReminded, moveToBacklog, changePriority, getPriorityColor } from "@/actions/actions";
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
import { Task, Priority } from "@/lib/interface";

interface TaskReminderDialogProps {
  open: boolean;
  taskList: Task[];
  priorities: Priority[]
  onOpenChange: (open: boolean) => void;
}

export function TaskReminderDialog({ open, taskList, priorities, onOpenChange }: TaskReminderDialogProps) {
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

  const handleNextTask = (next: number) => {
    if (hasMoreTasks) {
      console.log("There are more tasks still");

      // if next is at end of list, reset to 0
      // if next is > current, increase index
      // if next is < current, decrease index
      // if next is undefined, increase index
      // if (next >= taskList.length - 1) {
      //   setCurrentTaskIndex(0);
      // } else if (next <= 0) {
      //   setCurrentTaskIndex(taskList.length - 1);
      // } else {
      //   setCurrentTaskIndex(next);
      // }
      const nextIndex = next < 0 ? currentTaskIndex - 1 : currentTaskIndex + 1;
      setCurrentTaskIndex(nextIndex);
      onOpenChange(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleCompleteNow = async () => {
    if (!currentTask) return;
    
    try {
      // Mark task as reminded
      await markTaskAsReminded(currentTask.id);
      
      // Decrease the number of tasks left
      setTasksLeft(prev => prev - 1);

      // Move to next task or close dialog
      handleNextTask(1);
      
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
      // Get the next lower priority level by adding one (which will get a higher order, thus lower priority)
      const currentPriority = priorities.find(p => p.id === currentTask.priority);
      if (!currentPriority) {
        toast({
          title: "Error",
          description: "Failed to find current task priority",
          variant: "destructive",
        });
        return;
      }

      // Get next lowest priority by sorting priorities by order, finding the next highest, or returning the same if there is none
      let newPriority = priorities
        .filter(p => p.order > currentPriority.order)
        .sort((a, b) => a.order - b.order)[0]?.id;
      if (!newPriority) {
        toast({
          title: "Error",
          description: "You're already at the lowest priority! Want to move to backlog?",
          variant: "destructive",
        });
        newPriority = currentTask.priority; // fallback to current priority
        // TODO: Add move to backlog option

      } else {
        // Change priority and mark as reminded
        await changePriority(currentTask.id, newPriority);
      }
      
      await markTaskAsReminded(currentTask.id);
      
      toast({
        title: "Priority lowered",
        description: "Task priority has been reduced",
      });
      
      // Move to next task or close dialog
      handleNextTask(1);
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
      handleNextTask(1);
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
    handleNextTask(1);
    
  };

  const findPriorityColor = async (priorityId: number) => {
    try {
      const priorityColor = await getPriorityColor(priorityId);
      console.log("FOUND priority color: ", priorityColor);
      return priorityColor;
    } catch (error) {
      console.error("Error fetching priority color.");
      return "text-muted-foreground";
    }
  };

  if (!currentTask) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Task Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Loading taskList that need attention...
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

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
  const taskPriority = priorities.find(p => p.id === currentTask.priority);
  const taskPriorityColor = priorities.find(p => p.id === currentTask.priority)?.color;
  console.log("Just looked for priority color, this what we found: ", taskPriorityColor);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <span>Task Reminder</span>
            <span onClick={() => onOpenChange(false)} className="cursor-pointer underline"><XCircle className="hover:fill-amber-100 hover:stroke-amber-900"/></span>  
          </AlertDialogTitle>
          <AlertDialogDescription>
            This task has been on your list for <b>{daysOld} days</b>. Do you still want to complete it?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* Task card */}
        <div className="w-full max-w-full">
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">{currentTask.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">Priority:</span>
              <span className="font-medium" style={{ color: taskPriorityColor }}>
                <Flag className="h-4 w-4 inline-block mr-1" />
                {taskPriority?.name || "No Priority"}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Added {daysOld} days ago
            </div>
          </div>
          
          {/* total tasks to remind about */}
          <div className="w-full flex justify-between items-center mb-2">
            <div className="flex items-center max-w-full text-sm text-gray-500">
              {/* arrows to let user navigate through tasks that require reminding */}
              <div className=" ml-2">
              {hasMoreTasks ? (
                <>
                  <span className={`text-gray-600 px-1 py-0.5 mr-2 rounded border border-gray-500 ${currentTaskIndex === 0 ? "opacity-50 cursor-not-allowed bg-gray-300" : "bg-beige hover:bg-beigeoff cursor-pointer"}`}>
                    <span
                      className=""
                      onClick={currentTaskIndex === 0 ? undefined : () => handleNextTask(-1)}
                      tabIndex={currentTaskIndex === 0 ? -1 : 0}
                      aria-disabled={currentTaskIndex === 0}
                    >
                      <MoveLeft className="h-4 w-4 inline-block" />
                    </span>
                  </span>
                  {taskList.length > 1 && (
                    <Badge variant="outline" className="">
                      {currentTaskIndex + 1} of {taskList.length} taskList
                    </Badge>
                  )}
                  <span className={`text-gray-500 px-1 py-0.5 ml-2 rounded border border-gray-500 ${currentTaskIndex === taskList.length - 1 ? "opacity-50 cursor-not-allowed bg-gray-300" : "bg-beige hover:bg-beigeoff cursor-pointer"}`}>
                    <span
                      className=""
                      onClick={currentTaskIndex === taskList.length - 1 ? undefined : () => handleNextTask(1)}
                      tabIndex={currentTaskIndex === taskList.length - 1 ? -1 : 0}
                      aria-disabled={currentTaskIndex === taskList.length - 1}
                    >
                      <MoveRight className="h-4 w-4 inline-block" />
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
            <div>
              <Badge onClick={() => onOpenChange(false)} variant="outline" className="cursor-pointer hover:bg-amber-100 hover:text-amber-900">
                Ignore All
              </Badge>
            </div>
          </div>
        </div>
        
        <AlertDialogFooter className="flex flex-col sm:flex-col sm:justify-between sm:flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 border-black"
            onClick={handleCompleteNow}
            title="Complete Task Now"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            I'll do it now
          </Button>
            <Button 
              variant="outline" 
              className="w-full bg-amber-400 hover:bg-amber-300 text-black"
              onClick={handleLowerPriority}
            >
              <Flag className="h-4 w-4 mr-2" />
              Lower priority
            </Button>
            <Button 
              variant="outline" 
              className="w-full bg-amber-300 hover:bg-amber-200 "
              onClick={handleMoveToBacklog}
            >
              <Archive className="h-4 w-4 mr-2" />
              Move to backlog
            </Button>
          <AlertDialogCancel onClick={handleDismiss} className="bg-amber-900 text-white hover:bg-amber-800 border-black">
            Remind me later
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
