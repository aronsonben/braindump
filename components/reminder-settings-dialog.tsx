"use client"

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";
import { updatePreferences } from "@/actions/actions";
import { Priority, type UserPreferences } from "@/lib/interface";

interface ReminderSettingsDialogProps {
  trigger?: React.ReactNode;
  preferences?: UserPreferences | null;
  priorities: Priority[]
}

export function ReminderSettingsDialog({ trigger, preferences, priorities }: ReminderSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [reminderThreshold, setReminderThreshold] = useState(7);
  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState("daily");
  const [selectedPriorities, setSelectedPriorities] = useState<number[]>([0, 1]);
  const { toast } = useToast();

  // Update form state when preferences are loaded
  useEffect(() => {
    console.log("Trying to load preferences...", preferences);
    if (preferences) {
      console.log("Preferences loaded:", preferences.id);
      setReminderThreshold(preferences.reminder_threshold);
      setEnableReminders(preferences.enable_reminders);
      setReminderFrequency(preferences.reminder_frequency);
      setSelectedPriorities(preferences.priority_levels_to_remind as number[]);
    }
  }, [preferences]);

  // TODO: should prob see if there's a better way to do this
  const pathname = usePathname();
  if (pathname === "/") {
    console.log("ReminderSettings: Not on home page");
    return;
  }

  const handleSave = async () => {
    try {
      await updatePreferences({
        reminder_threshold: reminderThreshold,
        enable_reminders: enableReminders,
        reminder_frequency: reminderFrequency,
        priority_levels_to_remind: selectedPriorities,
      });
      
      toast({
        title: "Settings saved",
        description: "Your reminder preferences have been updated.",
      });
      
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePriority = (priority: number) => {
    setSelectedPriorities(prev => {
      if (prev.includes(priority)) {
        return prev.filter(p => p !== priority);
      } else {
        return [...prev, priority];
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    if(open) {
      console.log(preferences);
      console.log("Reminder Threshold:", reminderThreshold);
      console.log("Enable Reminders:", enableReminders);
      console.log("Reminder Frequency:", reminderFrequency);
      console.log("Selected Priorities:", selectedPriorities);
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Reminder Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reminder Settings</DialogTitle>
          <DialogDescription>
            Configure when and how you want to be reminded about tasks.
          </DialogDescription>
        </DialogHeader>
      
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-reminders" className="flex-1">
              Enable task reminders
            </Label>
            <Switch
              id="enable-reminders"
              checked={enableReminders}
              onCheckedChange={setEnableReminders}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reminder-threshold">
              Remind me about tasks older than (days)
            </Label>
            <Input
              id="reminder-threshold"
              type="number"
              min={1}
              max={30}
              value={reminderThreshold}
              onChange={(e) => setReminderThreshold(parseInt(e.target.value) || 7)}
              disabled={!enableReminders}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reminder-frequency">
              Reminder frequency
            </Label>
            <Select
              value={reminderFrequency}
              onValueChange={setReminderFrequency}
              disabled={!enableReminders}
            >
              <SelectTrigger id="reminder-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              How often to remind you about the same task
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Priority levels to remind about</Label>
            <div className="space-y-2">
              {priorities.map((priority) => (
                <div key={priority.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={selectedPriorities.includes(priority.order)}
                    onCheckedChange={() => togglePriority(priority.order)}
                    disabled={!enableReminders}
                  />
                  <Label
                    htmlFor={`priority-${priority}`}
                    className="font-normal"
                  >
                    {priority.name}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              You'll only be reminded about tasks with these priority levels
            </p>
          </div>
        </div>
        
        
        <DialogFooter>
          <Button
            type="submit"
            variant="outline"
            onClick={handleSave}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
