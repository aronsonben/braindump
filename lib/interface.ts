export interface SimpleUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  website?: string;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  website: string;
  updated_at: Date;
}

export interface Task {
  id: number;
  user_id: string;
  title: string;
  priority: number;
  category_id: number;
  in_backlog: boolean;
  completed: boolean;
  position: number;
  created_at: Date;
  inserted_at: Date;
  last_reminded: Date;
  category_name: string;
  priority_name: string;
}

export interface Task {
    id: number;
  user_id: string;
  title: string;
  priority: number;
  category_id: number;
  in_backlog: boolean;
  completed: boolean;
  position: number;
  created_at: Date;
  inserted_at: Date;
  last_reminded: Date;
  category_name: string;
  priority_name: string;
}

export interface Category {
  id: number;
  user_id: string;
  name: string;
  color: string;
  created_at: Date;
}

// From database
export interface Priority {
  id: number;
  name: string;
  color: string;
  order: number;
  user_id: string;
  created_at: Date;
}

// Original hard coded values
export const PriorityLevel = {
  HIGH: 'high',
  MEDIUM_HIGH: 'medium-high',
  MEDIUM: 'medium',
  MEDIUM_LOW: 'medium-low',
  LOW: 'low',
} as const;
export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel];

export interface UserPreferences {
  id: string;
  user_id: string;
  reminder_threshold: number;
  enable_reminders: boolean;
  reminder_frequency: string;
  priority_levels_to_remind: number[];
}