import { cache } from 'react'
import { redirect } from "next/navigation";
import { ReminderSettingsDialog } from "./reminder-settings-dialog";
import { getUserData, getPriorities, getUserPreferences } from "@/utils/supabase/fetchData";

const getUserPreferencesCached = cache(getUserPreferences);
const getPrioritiesCached = cache(getPriorities);

interface ReminderSettingsDialogProps {
  trigger?: React.ReactNode;
}

export async function ReminderSettings({ trigger }: ReminderSettingsDialogProps) {
  const user = await getUserData();
  
  if (!user) {
    console.log("ReminderSettings: User not found");
    return;
  } 
  // TODO: only fetch when dialog is open
  const preferences = await getUserPreferencesCached(user.id);
  const priorities = await getPrioritiesCached(user.id);
  if (!preferences) {
    console.log("Preferences not found");
  }
  if (!priorities) {
    console.log("Priorities not found");
  }

  return (
    <ReminderSettingsDialog trigger={trigger} preferences={preferences} priorities={priorities} />
  );
}
