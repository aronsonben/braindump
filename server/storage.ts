import { tasks, type Task, type InsertTask, type UpdateTask } from "@shared/schema";

export interface IStorage {
  getTasks(): Promise<Task[]>;
  getBacklogTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: Partial<UpdateTask>): Promise<Task>;
  moveToBacklog(id: number): Promise<Task>;
  deleteTask(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private currentId: number;

  constructor() {
    this.tasks = new Map();
    this.currentId = 1;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => !task.inBacklog)
      .sort((a, b) => b.priority - a.priority);
  }

  async getBacklogTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.inBacklog)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const task: Task = {
      ...insertTask,
      id,
      createdAt: new Date(),
      inBacklog: false,
      completed: false
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: Partial<UpdateTask>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async moveToBacklog(id: number): Promise<Task> {
    return this.updateTask(id, { inBacklog: true });
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
