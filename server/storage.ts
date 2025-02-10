import { tasks, categories, type Task, type InsertTask, type UpdateTask, type Category, type InsertCategory, PriorityLevel } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

const priorityOrder = {
  [PriorityLevel.HIGH]: 5,
  [PriorityLevel.MEDIUM_HIGH]: 4,
  [PriorityLevel.MEDIUM]: 3,
  [PriorityLevel.MEDIUM_LOW]: 2,
  [PriorityLevel.LOW]: 1,
};

export interface IStorage {
  // Task operations
  getTasks(): Promise<Task[]>;
  getBacklogTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<UpdateTask>): Promise<Task>;
  moveToBacklog(id: number): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTasks(): Promise<Task[]> {
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.inBacklog, false));

    return allTasks.sort((a, b) => 
      priorityOrder[b.priority as PriorityLevel] - priorityOrder[a.priority as PriorityLevel]
    );
  }

  async getBacklogTasks(): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.inBacklog, true))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        inBacklog: false,
        completed: false,
      })
      .returning();
    return task;
  }

  async updateTask(id: number, updates: Partial<UpdateTask>): Promise<Task> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();

    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }

    return task;
  }

  async moveToBacklog(id: number): Promise<Task> {
    return this.updateTask(id, { inBacklog: true });
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .orderBy(categories.name);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    // First update all tasks in this category to have no category
    await db
      .update(tasks)
      .set({ categoryId: null })
      .where(eq(tasks.categoryId, id));

    // Then delete the category
    await db.delete(categories).where(eq(categories.id, id));
  }
}

export const storage = new DatabaseStorage();