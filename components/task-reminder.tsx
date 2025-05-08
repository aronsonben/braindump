import { cache } from 'react'
import { redirect } from "next/navigation";
import { TaskReminderDialog } from "./task-reminder-dialog";
import { Task } from '@/lib/interface';
import { getUserData, getTasksNeedingReminders } from "@/utils/supabase/fetchData";

const getTasksNeedingRemindersCached = cache(getTasksNeedingReminders);

interface TaskReminderProps {
  open: boolean;
  tasksNeedingReminders?: Task[];
  onOpenChange: (open: boolean) => void;
}

export async function TaskReminder({ open, tasksNeedingReminders = [], onOpenChange }: TaskReminderProps) {
  // Only fetch tasks needing reminders when the dialog is open
  // let tasksNeedingReminders: Task[] = [];
  // if (open) {
  //   try {
  //     tasksNeedingReminders = await getTasksNeedingRemindersCached(user.id);
  //     console.log(`Found ${tasksNeedingReminders.length} tasks needing reminders`);
  //   } catch (error) {
  //     console.error("Error fetching tasks needing reminders:", error);
  //   }
  // }

  return (
    <TaskReminderDialog 
      open={open} 
      taskList={tasksNeedingReminders} 
      onOpenChange={onOpenChange}
    />
  )
}
