import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const PriorityLevel = {
  HIGH: 'high',
  MEDIUM_HIGH: 'medium-high',
  MEDIUM: 'medium',
  MEDIUM_LOW: 'medium-low',
  LOW: 'low',
} as const;

export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel];

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  priority: text("priority").notNull().default(PriorityLevel.MEDIUM),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  inBacklog: boolean("in_backlog").notNull().default(false),
  completed: boolean("completed").notNull().default(false)
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  priority: true
});

export const updateTaskSchema = createInsertSchema(tasks).pick({
  priority: true,
  inBacklog: true,
  completed: true
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;