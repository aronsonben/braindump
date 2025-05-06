"use server";

import { revalidatePath } from "next/cache";
import { Task, PriorityLevel, Category } from "@/lib/interface";
import { createClient } from "@/utils/supabase/server";

/**
 * Change the priority level of a given task.
 * @param taskId task id
 * @param priority new priority level
 */
export async function changePriority(taskId: number, priority: string) {
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from("tasks")
    .update({ priority: priority })
    .eq("id", taskId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/go");
}

/**
 * Change the category of a given task.
 * @param taskId task id
 * @param categoryId new category id or null to remove category
 */
export async function changeCategory(taskId: number, categoryId: number | null) {
  const supabase = await createClient();

  console.log("Changing category of task with id:", taskId);
  console.log("New category id:", categoryId);

  // dont need to confirm that category exists bc it's only an option for the user if it does

  const { data, error } = await supabase
    .from("tasks")
    .update({ category_id: categoryId })
    .eq("id", taskId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/go");
}

/**
 * Move a task to the backlog.
 * @param id task id
 */
export async function moveToBacklog(id: number) {
  const supabase = await createClient();

  console.log("Moving task to backlog:", id);

  const { data, error } = await supabase
    .from("tasks")
    .update({ in_backlog: true })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/go");
}

/**
 * Delete a task.
 * @param id task id
 */
export async function deleteTask(id: number) {
  const supabase = await createClient();

  console.log("Deleting task:", id);

  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/go");
}
