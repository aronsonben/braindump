import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  priority: integer("priority").notNull().default(0),
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
