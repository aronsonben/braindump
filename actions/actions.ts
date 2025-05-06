"use server";

import { revalidatePath } from "next/cache";
import { Task, PriorityLevel, Category } from "@/lib/interface";
import { createClient } from "@/utils/supabase/server";

/**
 * Creates a new task from the braindump functionality
 * @param taskList set of new tasks, split by new line and set back as list
 */
export async function createTasks(taskList: string[]) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  // Rate limiting - limit tasks per request
  if (taskList.length > 50) {
    throw new Error("Too many tasks in a single request");
  }

  // Server-side validation of task stirngs
  const validTasks = taskList.filter(task => {
    const trimmed = task.trim();
    if (trimmed.length === 0 || trimmed.length > 200) return false;
    
    const safePattern = /^[a-zA-Z0-9\s.,;:!?()[\]{}'"@#$%&*_\-+=<>\/\\]+$/;
    return safePattern.test(trimmed);
  });

  for (const text of validTasks) {
    console.log("Creating task:", text);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: text,
        priority: PriorityLevel.MEDIUM,
        category_id: null,
        created_at: new Date(),
        in_backlog: false,
        completed: false,
        last_reminded: null,
      })
      .select();

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath("/go");
}

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
 * Move a task OUT of the backlog.
 * @param id task id
 */
export async function resumeTask(id: number) {
  const supabase = await createClient();

  console.log("Moving task out of backlog:", id);

  const { data, error } = await supabase
    .from("tasks")
    .update({ in_backlog: false })
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

/**
 * Create a new category
 * @param name task id
 * @param color category color
 */
export async function createCategory(name: string, color: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  console.log("Creating new category:", name);

  const { data, error } = await supabase
    .from("categories")
    .insert({ 
      user_id: user.id, 
      name: name, 
      color: color 
    })
    .select();

  console.log("Created category:", data);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/go");
}

/**
 * Delete a category.
 * @param id category id
 */
export async function deleteCategory(id: number) {
  const supabase = await createClient();

  console.log("Deleting category:", id);

  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/go");
}