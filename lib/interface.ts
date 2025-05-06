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
  priority: string;
  category_id: number;
  in_backlog: boolean;
  completed: boolean;
  position: number;
  created_at: Date;
  inserted_at: Date;
  last_reminded: Date;
}

export interface Category {
  id: number;
  user_id: string;
  name: string;
  color: string;
  created_at: Date;
}

export const PriorityLevel = {
  HIGH: 'high',
  MEDIUM_HIGH: 'medium-high',
  MEDIUM: 'medium',
  MEDIUM_LOW: 'medium-low',
  LOW: 'low',
} as const;
export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel];