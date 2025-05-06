import { createClient } from "@/utils/supabase/server";
import { Profile, Task, Category } from "@/lib/interface"
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

export const getTasks = async (user_id: string) => {
  const supabase = await createClient();

  const { data: tasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user_id);

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