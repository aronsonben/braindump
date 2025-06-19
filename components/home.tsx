"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TaskReminderDialog } from "@/components/task-reminder-dialog";
import { TaskList } from "@/components/task-list";
import { Task, Category, Priority } from "@/lib/interface";
import { useToast } from "@/hooks/use-toast";
import { HomeIcon } from "lucide-react";

interface HomeProps {
  tasks: Task[];
  categories: Category[];
  priorities: Priority[];
  tasksNeedingReminders?: Task[];
  enableReminders?: boolean;
}

export default function Home({ tasks, categories, priorities, tasksNeedingReminders = [], enableReminders = true }: HomeProps) {
  const [showReminders, setShowReminders] = useState(false);
  const [sortBy, setSortBy] = useState('position');
  const [sortedTasks, setSortedTasks] = useState(tasks);
  const [bulkEditable, setBulkEditable] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
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
    console.log("[Home] New Tasks! Time to sort by ", sortBy);
    
    switch (sortBy) {
      case 'position':
        // Tasks should already be sorted by position from the server
        // But ensure we're using the position field
        newSortedTasks.sort((a, b) => (a.position || 0) - (b.position || 0));
        break;
      case 'priority':
        // Sort by priority (custom order)
        priorities.sort((a, b) => a.order - b.order);
        newSortedTasks.sort((a, b) => {
          const priorityA = priorities.find(p => p.id === a.priority)?.order || 0;
          const priorityB = priorities.find(p => p.id === b.priority)?.order || 0;
          return priorityA - priorityB;
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
        // Sort by creation date (oldest first)
        newSortedTasks.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        break;
      default:
        // Tasks should already be sorted by position from the server
        // But ensure we're using the position field
        newSortedTasks.sort((a, b) => (a.position || 0) - (b.position || 0));
        break;
    }
    
    setSortedTasks(newSortedTasks);
  }, [tasks, sortBy, categories, priorities]);

  const handleSortChange = useCallback((newSortBy: string) => {
    setSortBy(newSortBy);
  }, []);

  const toggleBulkEdit = () => {
    setBulkEditable(!bulkEditable);
  }

  return (
    <div className="w-full bg-background">
      <TaskReminderDialog
        open={showReminders}
        taskList={tasksNeedingReminders}
        priorities={priorities}
        onOpenChange={handleReminderDialogChange}
      />
      <div className="w-full flex items-center justify-between gap-4 container mx-auto px-4">
        <div className="flex items-center gap-4 container mx-auto">
        <Link href="/go">
          <Button variant="ghost" size="icon">
            <HomeIcon className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-foreground bg-clip-text">
          Home
        </h1>
        </div>
        <div className="">
          <Button 
            variant="outline" 
            size="default" 
            className="cursor-pointer bg-cream hover:bg-tanskin"
            onClick={toggleBulkEdit}
          >
            Toggle Bulk Edit
          </Button>
        </div>
      </div>
      <div className="w-full flex items-center justify-end px-10 pt-4 mb-[-12px]">
        {bulkEditable && (
          <p className="font-normal italic text-gray-400">{selectedTaskIds.length} of {tasks.length} selected</p>
        )}
      </div>
      <div className="container mx-auto px-4 py-4">
        {tasks?.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No tasks yet!</h2>
            <p className="text-muted-foreground mb-8">
              Start by creating a new brain dump to add some tasks.
            </p>
            <Link href="/braindump">
              <Button variant="outline">Create Brain Dump</Button>
            </Link>
          </div>
        ) : (
          <TaskList 
            tasks={sortedTasks || []} 
            categories={categories}
            priorities={priorities}
            onSortChange={handleSortChange}
            currentSort={sortBy}
            bulkEditable={bulkEditable}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
          />
        )}
      </div>
    </div>
  );
}
