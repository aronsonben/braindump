import { createClient } from "@/utils/supabase/server";
import { Profile, Task, Category, Priority, UserPreferences } from "@/lib/interface"
// import { SupabaseClient } from "@supabase/supabase-js";

export const getUserData = async (userName?: string) => {
  const supabase = await createClient();

  if (userName) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", userName)
      .single();
    // TODO: Might want to add a null check or some error behavior
    return profile;
  }

  const { data, error } = await supabase.auth.getUser();

  if (!data?.user) {
    return null;
  }

  return data.user;
};

export const getUserProfile = async (user_id: string) => {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user_id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return profile as Profile;
}

export const getUserPreferences = async (user_id: string) => {
  const supabase = await createClient();

  // Fetch user preferences from the user_preferences table
  const { data: preferences, error: preferencesError } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (preferencesError) {
    // throw new Error(preferencesError.message);
    return null; // Handle the error as needed
  }

  return preferences as UserPreferences;
}

export const getActiveTasks = async (user_id: string, sortBy: string = 'position') => {
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user_id)
    .eq("in_backlog", false)
    .eq("completed", false);
    
  // Apply sorting based on the sortBy parameter
  switch (sortBy) {
    case 'position':
      query = query.order('position', { ascending: true });
      break;
    case 'priority':
      // Custom priority order: high -> medium-high -> medium -> medium-low -> low
      query = query.order('priority', { ascending: false }); // This is approximate, we'll refine in client
      break;
    case 'category':
      query = query.order('category_id', { ascending: true });
      break;
    case 'age':
      query = query.order('created_at', { ascending: false }); // Newest first
      break;
    default:
      query = query.order('position', { ascending: true });
  }

  const { data: tasks, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return tasks as Task[];
};

export const getActiveTasksNeedingReminders = async (user_id: string) => {
  const supabase = await createClient();

  console.log("Fetching tasks needing reminders for user:", user_id);
  
  // Get user preferences
  const preferences = await getUserPreferences(user_id);
  
  if (!preferences || !preferences.enable_reminders) {
    return []; // Reminders are disabled or preferences not found
  }

  const now = new Date();
  const reminderThresholdDate = new Date();
  reminderThresholdDate.setDate(reminderThresholdDate.getDate() - preferences.reminder_threshold);
  
  // Get tasks that meet the basic criteria
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user_id)
    .eq("in_backlog", false)
    .eq("completed", false)
    .lte("created_at", reminderThresholdDate.toISOString());

  if (error) {
    console.error("Error fetching tasks for reminders:", error);
    throw new Error(error.message);
  }

  if (!tasks || tasks.length === 0) {
    return [];
  }

  // Filter tasks by priority level
  const priorityLevels = preferences.priority_levels_to_remind as number[];
  const filteredByPriority = tasks.filter(task => 
    priorityLevels.includes(task.priority)
  );


  console.log("Found some tasks filtered by priority:", filteredByPriority);


  // Further filter tasks based on last_reminded and reminder_frequency
  const filteredByDate = filteredByPriority.filter(task => {
    // If never reminded, include it
    if (!task.last_reminded) {
      return true;
    }

    // Check if enough time has passed since last reminder based on frequency
    const lastRemindedDate = new Date(task.last_reminded);
    const daysSinceLastReminder = Math.floor(
      (now.getTime() - lastRemindedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (preferences.reminder_frequency === 'daily') {
      return daysSinceLastReminder >= 1;
    } else if (preferences.reminder_frequency === 'weekly') {
      return daysSinceLastReminder >= 7;
    }
    
    return true; // Default to including the task
  });

  return filteredByDate;
};

export const getBacklogTasks = async (user_id: string, sortBy: string = 'position') => {
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user_id)
    .eq("in_backlog", true)
    .eq("completed", false);
    
  // Apply sorting based on the sortBy parameter
  switch (sortBy) {
    case 'position':
      query = query.order('position', { ascending: true });
      break;
    case 'priority':
      // Custom priority order: high -> medium-high -> medium -> medium-low -> low
      query = query.order('priority', { ascending: false }); // This is approximate, we'll refine in client
      break;
    case 'category':
      query = query.order('category_id', { ascending: true });
      break;
    case 'age':
      query = query.order('created_at', { ascending: false }); // Newest first
      break;
    default:
      query = query.order('position', { ascending: true });
  }

  const { data: tasks, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return tasks as Task[];
};

export const getCategories = async (user_id: string) => {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    throw new Error(error.message);
  }

  return categories as Category[];
};

export const getPriorities = async (user_id: string) => {
  const supabase = await createClient();

  const { data: priorities, error } = await supabase
    .from("priorities")
    .select("*")
    .eq("user_id", user_id)
    .order("order", { ascending: true })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  console.log("Priorities:", priorities);

  return priorities as Priority[];
};


// export const getUserIdByName = async (username: string) => {
//   const supabase = await createClient();

//   const { data: profile, error } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("username", username)
//     .single();

//   if (error) {
//     throw new Error(error.message);
//   }

//   return profile as Profile;
// }

// export const getUserTracks = async (user_id: string) => {
//   const supabase = await createClient();

//   const { data: tracks, error } = await supabase
//     .from("tracks")
//     .select("*")
//     .eq("user_id", user_id);

//   if (error) {
//     throw new Error(error.message);
//   }

//   return tracks;
// };

// export const getUserTracksByName = async (username: string) => {
//   const supabase = await createClient();

//   const profile = await getUserIdByName(username);

//   const { data: tracks, error } = await supabase
//     .from("tracks")
//     .select("*")
//     .eq("user_id", profile.id);

//   if (error) {
//     throw new Error(error.message);
//   }

//   return tracks;
// };

// /** Retrieve a list of all published picker pages tied to the specified user */
// export const getUserPickerPages = async (user_id: string) => {
//   const supabase = await createClient();

//   const { data: pages, error } = await supabase
//     .from("picker_pages")
//     .select("*")
//     .eq("user_id", user_id);

//   if (error) {
//     throw new Error(error.message);
//   }

//   return pages;
// }

// /** **********************************
// ********** Track Functions *********
// *********************************** */

// export const getTrackById = async (id: number) => {
//   const supabase = await createClient();

//   const { data: track, error } = await supabase
//     .from("tracks")
//     .select("*")
//     .eq("id", id)
//     .single();

//   if (error) {
//     throw new Error(error.message);
//   }

//   return track;
// };

// /** **********************************
// ********** Get ALL Functions *********
// *********************************** */

// export const getAllUsers = async () => {
//   const supabase = await createClient();

//   const { data: users, error } = await supabase
//     .from("profiles")
//     .select("*")

//   if (error) {
//     throw new Error(error.message);
//   }

//   return users;
// };

// /** Retrieve a list of all published picker pages in the database */
// export const getAllPickerPages = async (): Promise<PickerPage[]> => {
//   const supabase = await createClient();

//   const { data: pages, error } = await supabase
//     .from("picker_pages")
//     .select("*");

//   if (error) {
//     throw new Error(error.message);
//   }

//   // Should eventually use supabase-js dynamically generated types instead of this
//   return pages as PickerPage[];
// }

// export const getAllTracks = async () => {
//   const supabase = await createClient();

//   const { data: tracks, error } = await supabase
//     .from("tracks")
//     .select("*");

//   if (error) {
//     throw new Error(error.message);
//   }

//   return tracks;
// }

// /** **********************************
// ********** Misc. Functions *********
// *********************************** */


// /** Retrieve list of tracks associated with the picker page page_name */
// export const getTracksByPickerPageName = async (pageName: string): Promise<Track[]> => {
//   const supabase = await createClient();

//   console.log("pageName:", pageName);

//   // 1. Get picker page ID from name
//   const { data: page, error: pageError } = await supabase
//     .from("picker_pages")
//     .select("id")
//     .eq("page_name", pageName)
//     .limit(1)
//     .single();

//   if (pageError) {
//     throw new Error(pageError.message);
//   }

//   const pickerPageId = page?.id;
//   console.log("[fetchData] pickerPageId:", pickerPageId);

//   // 2. Get tracks associated with the picker page ID
//   const { data: tracks, error: trackError } = await supabase
//     .from("tracks")
//     .select(`
//       *, 
//       picker_page_tracks!inner ( 
//         track_id
//       )`)
//     .eq("picker_page_tracks.picker_page_id", pickerPageId);

//   if (trackError) {
//     throw new Error(trackError.message);
//   }

//   return tracks as Track[];
// }

// /** Fetch random track from database */
// export const getRandomTrack = async () => {
//   const supabase = await createClient();

//   const { data: track, error } = await supabase.rpc('get_random_track').single();
  
//   if (error) {
//     throw new Error(error.message);
//   }

//   return track as Track;
// }
