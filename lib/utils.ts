import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function randomHex(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

/**
 * Sanitizes a task string to prevent potential security issues
 * @param task The raw task string input
 * @returns Sanitized task string or null if invalid
 */
export function sanitizeTask(task: string): string | null {
  // Trim whitespace
  const trimmed = task.trim();
  
  // Check length - reject empty or too long tasks
  if (trimmed.length === 0 || trimmed.length > 200) {
    return null;
  }
  
  // Allow only alphanumeric characters and common punctuation/symbols
  // This regex allows: letters, numbers, spaces, punctuation, and some special characters
  const safePattern = /^[a-zA-Z0-9\s.,;:!?()[\]{}'"@#$%&*_\-+=<>\/\\]+$/;
  
  if (!safePattern.test(trimmed)) {
    console.log("Caught an invalid task! ", trimmed);
    return null;
  }
  
  return trimmed;
}