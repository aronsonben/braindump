import { cache } from 'react'
import { redirect } from "next/navigation";
import { ReminderSettingsDialog } from "./reminder-settings-dialog";
import { getUserData, getUserPreferences } from "@/utils/supabase/fetchData";

const getUserPreferencesCached = cache(getUserPreferences);

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

  if (!preferences) {
    console.log("Preferences not found");
  }

  return (
    <ReminderSettingsDialog trigger={trigger} preferences={preferences} />
  );
}
