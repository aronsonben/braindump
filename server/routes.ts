import { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema, insertCategorySchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  // Task routes
  app.get("/api/tasks", async (_req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.get("/api/backlog", async (_req, res) => {
    const tasks = await storage.getBacklogTasks();
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const task = await storage.createTask(result.data);
    res.json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = updateTaskSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const task = await storage.updateTask(id, result.data);
    res.json(task);
  });

  app.post("/api/tasks/:id/backlog", async (req, res) => {
    const id = parseInt(req.params.id);
    const task = await storage.moveToBacklog(id);
    res.json(task);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteTask(id);
    res.status(204).send();
  });

  // Add this route with the existing task routes
  app.post("/api/tasks/reorder", async (req, res) => {
    const taskIds = req.body.taskIds;
    if (!Array.isArray(taskIds)) {
      return res.status(400).json({ error: "taskIds must be an array" });
    }
    await storage.reorderTasks(taskIds);
    res.status(204).send();
  });

  // Category routes
  app.get("/api/categories", async (_req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    const result = insertCategorySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    const category = await storage.createCategory(result.data);
    res.json(category);
  });

  app.delete("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCategory(id);
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}