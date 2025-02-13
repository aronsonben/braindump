import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const PriorityLevel = {
  HIGH: 'high',
  MEDIUM_HIGH: 'medium-high',
  MEDIUM: 'medium',
  MEDIUM_LOW: 'medium-low',
  LOW: 'low',
} as const;

export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel];

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#94a3b8"), // Default slate-400 color
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  priority: text("priority").notNull().default(PriorityLevel.MEDIUM),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  inBacklog: boolean("in_backlog").notNull().default(false),
  completed: boolean("completed").notNull().default(false),
  position: integer("position"),  // New field for custom ordering
});

export const tasksRelations = relations(tasks, ({ one }) => ({
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id],
  }),
}));

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  priority: true,
  categoryId: true,
  position: true
});

export const updateTaskSchema = createInsertSchema(tasks).pick({
  priority: true,
  inBacklog: true,
  completed: true,
  categoryId: true,
  position: true
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  color: true
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;