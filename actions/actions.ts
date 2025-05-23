"use server";

import { revalidatePath } from "next/cache";
import { Task, PriorityLevel, Category, Priority } from "@/lib/interface";
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

  // TODO: handle this error
  if (!user) {
    throw new Error("User not found");
  }

  // Rate limiting - limit tasks per request
  // TODO: need to error handle this
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

  for (const [index, text] of validTasks.entries()) {
    console.log("Creating task:", text);
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: user.id,
        title: text,
        priority: 2, // default priority ("medium"),
        category_id: null,
        created_at: new Date(),
        in_backlog: false,
        completed: false,
        last_reminded: null,
        position: index,
      });

    // TODO: handle this error
    if (error) {
      console.error("Error creating task:", error);
      throw new Error(error.message);
    }
  }

  revalidatePath("/go");
}

/**
 * Change the priority level of a given task.
 * @param taskId task id
 * @param priorityId new priority id
 */
export async function changePriority(taskId: number, priorityId: number) {
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from("tasks")
    .update({ priority: priorityId })
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
 * Mark a task as reminded by updating the last_reminded timestamp
 * @param taskId task id
 */
export async function markTaskAsReminded(taskId: number) {
  const supabase = await createClient();

  console.log("Marking task as reminded:", taskId);

  const { data, error } = await supabase
    .from("tasks")
    .update({ last_reminded: new Date().toISOString() })
    .eq("id", taskId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // revalidatePath("/go");
  return data;
}

/** 
 * Reorder tasks per drag and drop
 * @param newOrder list of task ids in new order
 */
export async function reorderTasks(newOrder: number[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  // Update each task with its new position
  for (let i = 0; i < newOrder.length; i++) {
    const taskId = newOrder[i];
    const { error } = await supabase
      .from("tasks")
      .update({ position: i })
      .eq("id", taskId);
      
    if (error) {
      throw new Error(`Error updating task ${taskId}: ${error.message}`);
    }
  }

  revalidatePath("/go");
  return newOrder;
}

/* ************************************************************************ */
/* ****** CATEGORY FUNCTIONS **************************************** */
/* ************************************************************************ */

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

/* ************************************************************************ */
/* ****** PRIORITY FUNCTIONS **************************************** */
/* ************************************************************************ */

// export async function getPriorities() {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();
//   if (!user) {
//     throw new Error("User not found");
//   }
//   const { data, error } = await supabase
//     .from("priorities")
//     .select("*")
//     .eq("user_id", user.id)
//     .order("order", { ascending: true });
//   if (error) {
//     throw new Error(error.message);
//   }
//   return data as Priority[];
// }

/**
 * Create a new priority
 * @param name task id
 * @param color priority color
 */
export async function createPriority(name: string, color: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user already has 10 priorities
  const { count, error: countError } = await supabase
    .from("priorities")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  if (countError) {
    throw new Error(countError.message);
  }
  if ((count ?? 0) >= 10) {
    throw new Error("You can only have a maximum of 10 priorities.");
  }

  console.log("Creating new priority:", name);

  const { data, error } = await supabase
    .from("priorities")
    .insert({ 
      name: name, 
      color: color,
      order: 999, // default order
      user_id: user.id, 
    })
    .select();

  console.log("Created priority:", data);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/go");
  return data;
}

/**
 * Delete a priority.
 * @param id priority id
 */
export async function deletePriority(id: number) {
  const supabase = await createClient();

  console.log("Deleting priority:", id);

  const { data, error } = await supabase
    .from("priorities")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/go");
}


/**
 * Reorder priorities per drag and drop
 * @param newOrder Array of objects: {id, order}
 */
export async function reorderPriorities(newOrder: {id: number, order: number}[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  // Update each priority with its new order
  for (let i = 0; i < newOrder.length; i++) {
    const { id, order } = newOrder[i];
    const { error } = await supabase
      .from("priorities")
      .update({ order })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      throw new Error(`Error updating priority ${id}: ${error.message}`);
    }
  }

  revalidatePath("/go");
  revalidatePath("/priorities");
  return newOrder;
}

/**
 * Update the name of a priority
 * @param id priority id
 * @param name new name
 */
export async function updatePriorityName(id: number, name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not found");
  }
  const { error } = await supabase
    .from("priorities")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/go");
  revalidatePath("/priorities");
}

/**
 * Get entire priority object by Id
 * @param id priority id
 */
export async function getPriorityById(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // TODO: probably handle this error better
    throw new Error("User not found");
  }
  const { data: priority, error } = await supabase
    .from("priorities")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  
  return priority;
}

/**
 * Get the order level of a priority
 * @param id priority id
 */
export async function getPriorityLevel(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // TODO: probably handle this error better
    throw new Error("User not found");
  }
  const { data: order, error } = await supabase
    .from("priorities")
    .select("order")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  
  return order;
}


/* ************************************************************************ */
/* ****** MISC FUNCTIONS **************************************** */
/* ************************************************************************ */


/**
 * Update the name (title) of a task
 * @param id task id
 * @param title new title
 */
export async function updateTaskName(id: number, title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not found");
  }
  const { error } = await supabase
    .from("tasks")
    .update({ title })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/go");
}

/**
 * Update user preferences for reminders
 * @param preferences object containing user preference settings
 */
export async function updatePreferences(
  preferences: {
    reminder_threshold: number;
    enable_reminders: boolean;
    reminder_frequency: string;
    priority_levels_to_remind: number[];
  }
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .update({
      reminder_threshold: preferences.reminder_threshold,
      enable_reminders: preferences.enable_reminders,
      reminder_frequency: preferences.reminder_frequency,
      priority_levels_to_remind: preferences.priority_levels_to_remind,
    })
    .eq("user_id", user.id)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  // Revalidate paths where user preferences might be displayed
  revalidatePath("/go");
  revalidatePath("/braindump");
  revalidatePath("/categories");
  revalidatePath("/backlog");

  return data;
}
