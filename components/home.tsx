"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TaskReminder } from "@/components/task-reminder";
import { TaskReminderDialog } from "@/components/task-reminder-dialog";
import { TaskList } from "@/components/task-list";
import { Task, Category } from "@/lib/interface";
import { initializeTaskPositions } from "@/actions/actions";
import { useToast } from "@/hooks/use-toast";

interface HomeProps {
  tasks: Task[];
  categories: Category[];
  tasksNeedingReminders?: Task[];
  enableReminders?: boolean;
}

export default function Home({ tasks, categories, tasksNeedingReminders = [], enableReminders = true }: HomeProps) {
  const [showReminders, setShowReminders] = useState(false);
  const [sortBy, setSortBy] = useState('position');
  const [sortedTasks, setSortedTasks] = useState(tasks);
  const { toast } = useToast();

  const handleReminderDialogChange = (open: boolean) => {
    console.log("opening or closing");
    setShowReminders(open);
  }

  useEffect(() => {
    // Show reminders if there are tasks needing reminders
    if (tasksNeedingReminders.length > 0) {
      handleReminderDialogChange(true);
    }
  }, [tasksNeedingReminders]);

  // Apply client-side sorting when sort option changes or tasks update
  useEffect(() => {
    const newSortedTasks = [...tasks];
    
    switch (sortBy) {
      case 'position':
        // Tasks should already be sorted by position from the server
        // But ensure we're using the position field
        newSortedTasks.sort((a, b) => (a.position || 0) - (b.position || 0));
        break;
      case 'priority':
        // Sort by priority (custom order)
        newSortedTasks.sort((a, b) => {
          const priorityOrder = {
            'high': 0,
            'medium-high': 1,
            'medium': 2,
            'medium-low': 3,
            'low': 4
          };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
        });
        break;
      case 'category':
        // Sort by category name
        newSortedTasks.sort((a, b) => {
          const catA = categories.find(c => c.id === a.category_id)?.name || 'zzz'; // Put null categories at the end
          const catB = categories.find(c => c.id === b.category_id)?.name || 'zzz';
          return catA.localeCompare(catB);
        });
        break;
      case 'age':
        // Sort by creation date (newest first)
        newSortedTasks.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
    }
    
    setSortedTasks(newSortedTasks);
  }, [tasks, sortBy, categories]);

  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
  }, []);

  return (
    <div className="bg-background">
      <TaskReminderDialog
        open={showReminders}
        taskList={tasksNeedingReminders}
        onOpenChange={handleReminderDialogChange}
      />
      <div className="container mx-auto px-4 py-8">
        {tasks?.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No tasks yet!</h2>
            <p className="text-muted-foreground mb-8">
              Start by creating a new brain dump to add some tasks.
            </p>
            <Link href="/brain-dump">
              <Button variant="outline">Create Brain Dump</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* <div className="mb-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleInitializePositions}
                disabled={initializing}
              >
                {initializing ? "Initializing..." : "Initialize Task Positions"}
              </Button>
            </div> */}
            <TaskList 
              tasks={sortedTasks || []} 
              categories={categories}
              onSortChange={handleSortChange}
              currentSort={sortBy}
            />
          </>
        )}
      </div>
    </div>
  );
}
