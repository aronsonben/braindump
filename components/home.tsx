"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TaskReminder } from "@/components/task-reminder";
import { TaskReminderDialog } from "@/components/task-reminder-dialog";
import { TaskList } from "@/components/task-list";
import { Task, Category } from "@/lib/interface";

interface HomeProps {
  tasks: Task[];
  categories: Category[];
  tasksNeedingReminders?: Task[];
  enableReminders?: boolean;
}

export default function Home({ tasks, categories, tasksNeedingReminders = [], enableReminders = true }: HomeProps) {
  const [showReminders, setShowReminders] = useState(false);

  // useEffect(() => {
  //   // Show reminders if reminders are enabled
  //   // But only after a short delay to allow the app to load
  //   if (enableReminders) {
  //     const timer = setTimeout(() => {
  //       setShowReminders(true);
  //     }, 1000);
      
  //     return () => clearTimeout(timer);
  //   }
  // }, [enableReminders]);

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
    </div>
  );
}
