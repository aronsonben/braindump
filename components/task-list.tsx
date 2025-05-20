"use client"

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DraggableAttributes,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { changePriority, changeCategory, moveToBacklog, resumeTask, deleteTask, reorderTasks, updateTaskName } from '@/actions/actions';
import { Task, PriorityLevel, Category, Priority } from "@/lib/interface";
import { Flag, Archive, FolderOpen, Trash2, GripVertical } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { sanitizeTask } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  priorities: Priority[];
  showAge?: boolean;
  showBacklogButton?: boolean;
  showResumeButton?: boolean;
  onSortChange?: (sortBy: string) => void;
  currentSort?: string;
}

interface SortableTableRowProps {
  task: Task;
  children: (attributes: DraggableAttributes, listeners: SyntheticListenerMap | undefined) => React.ReactNode;
}

function SortableTableRow({ task, children, ...props }: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`hover:bg-muted/30 ${isDragging ? 'bg-muted/50' : ''}`}
      {...props}
    >
      {children(attributes, listeners)}
    </TableRow>
  );
}

export function TaskList({ 
  tasks, 
  categories, 
  priorities,
  showAge = true, 
  showBacklogButton = true, 
  showResumeButton = false,
  onSortChange,
  currentSort = 'position'
}: TaskListProps) {
  const { toast } = useToast();
  const [taskList, setTaskList] = useState(tasks);
  // Inline editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // This is a placeholder for any side effects you might want to run when tasks change
    // For example, you could fetch new data or update the UI
    console.log("Tasks updated:", tasks);
    setTaskList(tasks);
  }, [tasks])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getAgeColor = (days: number) => {
    if (days <= 3) return "text-secondary";
    if (days <= 7) return "text-accent";
    return "text-destructive";
  };

  const getPriorityColor = (priorityId: number) => {
    const taskPriority = priorities?.find(p => p.id === priorityId);
    if (!taskPriority) return "text-muted-foreground";
    return taskPriority.color;
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);

      const newTasks = [...tasks];
      const [movedTask] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, movedTask);

      // Update the UI immediately for optimistic updates
      setTaskList(newTasks);
      
      try {
        // Update the database in the background
        await reorderTasks(newTasks.map((task) => task.id));
      } catch (error) {
        // If the update fails, revert to the original order
        setTaskList(tasks);
        toast({
          title: "Error",
          description: "Failed to reorder tasks. Please try again.",
          variant: "destructive",
        });
        console.error("Error reordering tasks:", error);
      }
    }
  };

  const handlePriorityChange = async (id: number, priorityId: number) => {
    changePriority(id, priorityId);
  };

  const handleCategoryChange = (taskId: number, categoryId: number | null) => {
    console.log(`Changing category of task ${taskId} to ${categoryId}`);
    changeCategory(taskId, categoryId);
  };

  const handleMoveToBacklog = (id: number) => {
    moveToBacklog(id)
      .then(() => {
        console.log(`Task ${id} moved to backlog`);
        toast({
          title: "Task moved to backlog",
          description: "The task has been moved to the backlog successfully.",
          action: <ToastAction altText="Undo">Undo</ToastAction>,
        });
      }
      ).catch((error) => {
        console.error("Error moving task to backlog:", error);
        toast({
          title: "Error",
          description: "Failed to move the task to the backlog.",
          action: <ToastAction altText="Retry">Retry</ToastAction>,
        });
      }
      );
  };

  const handleResume = (id: number) => {
    resumeTask(id);
  };

  const handleDeleteTask = async (id: number) => {
    deleteTask(id)
      .then(() => {
        console.log(`Task ${id} deleted`);
          toast({
            title: "Task deleted",
            description: "The task has been deleted successfully.",
            action: <ToastAction altText="Undo">Undo</ToastAction>,
          });
        }).catch((error) => {
          console.error("Error deleting task:", error);
          toast({
            title: "Error",
            description: "Failed to delete the task.",
            action: <ToastAction altText="Retry">Retry</ToastAction>,
          });
        }
      );
  };

  // Inline edit handlers
  const handleStartEdit = (id: number, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(e.target.value);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleEditSave = async (id: number) => {
    const trimmed = sanitizeTask(editingTitle);
    if (!trimmed || taskList.find(t => t.id === id)?.title === trimmed) {
      handleEditCancel();
      return;
    }
    setIsSaving(true);
    try {
      await updateTaskName(id, trimmed);
      setTaskList(taskList.map(t => t.id === id ? { ...t, title: trimmed } : t));
      toast({
        title: "Task updated",
        description: "Task name has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        description: "Please try again",
        variant: "destructive",
      });
    }
    setIsSaving(false);
    handleEditCancel();
  };

  return (
    <>
    <div className="border rounded-lg bg-primary shadow-sm">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/30">
              <TableHead className="w-[32px]"></TableHead>
              <TableHead className="font-semibold text-foreground">Task</TableHead>
              {showAge && <TableHead className="font-semibold text-foreground">Age</TableHead>}
              <TableHead className="font-semibold text-foreground">Category</TableHead>
              <TableHead className="font-semibold text-foreground">Priority</TableHead>
              <TableHead className="font-semibold text-foreground w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={taskList.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {taskList.map((task) => {
                const daysOld = differenceInDays(new Date(), new Date(task.created_at));
                // const daysOld = 8;
                const taskCategory = categories?.find(c => c.id === task.category_id);
                const taskPriority = priorities?.find(p => p.id === task.priority);

                return (
                  <SortableTableRow key={task.id} task={task}>
                    {(attributes, listeners) => (
                      <>
                        <TableCell>
                          {currentSort === 'position' ? (
                            <Button
                              id="position-handle"
                              variant="ghost"
                              size="icon"
                              className="cursor-grab active:cursor-grabbing h-6 w-6"
                              {...attributes}
                              {...listeners}
                            >
                              <GripVertical className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          ) : (
                            <div className="h-6 w-6"></div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {editingId === task.id ? (
                            <span className="inline-flex items-center gap-1 w-full">
                              <input
                                className="border rounded px-1 py-0.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary max-w-[180px] truncate"
                                value={editingTitle}
                                autoFocus
                                onChange={handleEditChange}
                                onBlur={handleEditCancel}
                                onKeyDown={e => {
                                  if (e.key === "Enter") handleEditSave(task.id);
                                  if (e.key === "Escape") handleEditCancel();
                                }}
                                style={{ minWidth: 80 }}
                                disabled={isSaving}
                              />
                              <Button
                                id="save-button"
                                variant="ghost"
                                size="icon"
                                className="p-1"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => handleEditSave(task.id)}
                                aria-label="Save"
                                disabled={isSaving}
                              >
                                <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 8.5l3 3 5-5"/></svg>
                              </Button>
                              <Button
                                id="cancel-button"
                                variant="ghost"
                                size="icon"
                                className="p-1"
                                onMouseDown={e => e.preventDefault()}
                                onClick={handleEditCancel}
                                aria-label="Cancel"
                                disabled={isSaving}
                              >
                                <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5l6 6m0-6l-6 6"/></svg>
                              </Button>
                            </span>
                          ) : (
                            <span
                              className="cursor-pointer truncate block max-w-full"
                              tabIndex={0}
                              onClick={() => handleStartEdit(task.id, task.title)}
                              onKeyDown={e => {
                                if (e.key === "Enter" || e.key === " ") handleStartEdit(task.id, task.title);
                              }}
                              role="button"
                              aria-label="Edit task name"
                              title={task.title}
                            >
                              {task.title}
                            </span>
                          )}
                        </TableCell>
                        {showAge && (
                          <TableCell className={`${getAgeColor(daysOld)} font-medium text-xs`}>
                            {daysOld} days
                          </TableCell>
                        )}
                        <TableCell id="task-category-cell">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              {taskCategory ? (
                                <Badge
                                  variant="secondary"
                                  className="text-xs py-0.5 px-2 cursor-pointer hover:opacity-80"
                                  style={{
                                    backgroundColor: taskCategory.color,
                                    color: 'white',
                                    fontWeight: 'medium'
                                  }}
                                >
                                  {taskCategory.name}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-xs cursor-pointer hover:underline px-2 py-1 rounded hover:bg-muted/50">
                                  No category
                                </span>
                              )}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => handleCategoryChange(task.id, null)}>
                                <FolderOpen className="h-4 w-4 mr-2" />
                                Remove Category
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {categories?.map((category) => (
                                <DropdownMenuItem
                                  key={category.id}
                                  onClick={() => handleCategoryChange(task.id, category.id)}
                                >
                                  <div
                                    className="h-4 w-4 mr-2 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  {category.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell id="task-priority-cell">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className={`font-medium text-xs cursor-pointer hover:bg-muted/50 rounded px-2 py-1 inline-flex items-center`} style={{ color: getPriorityColor(task.priority) }}>
                                <Flag className="h-3 w-3 inline-block mr-1" />
                                {taskPriority?.name || "No priority"}
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {priorities?.map((priority) => (
                                <DropdownMenuItem onClick={() => handlePriorityChange(task.id, priority.id)} key={priority.id}>
                                  <Flag className="h-4 w-4 mr-2" style={{ color: priority.color }}/>
                                  {priority.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              id="delete-button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTask(task.id)}
                              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Delete task"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            {showBacklogButton && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMoveToBacklog(task.id)}
                                className="h-6 text-xs py-0 text-muted-foreground hover:bg-muted"
                                title="Move to backlog"
                              >
                                <Archive className="h-3 w-3 mr-1" />
                                Backlog
                              </Button>
                            )}
                            {showResumeButton && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResume(task.id)}
                                className="h-6 text-xs py-0 text-muted-foreground hover:bg-muted"
                                title="Move to backlog"
                              >
                                <Archive className="h-3 w-3 mr-1" />
                                Resume
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </>
                    )}
                  </SortableTableRow>
                );
              })}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>
    </div>
    {onSortChange && (
        <div className="p-2 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <span>Sort by:</span>
                {currentSort === 'position' && <span>Manual Order</span>}
                {currentSort === 'priority' && <span>Priority</span>}
                {currentSort === 'category' && <span>Category</span>}
                {currentSort === 'age' && <span>Age</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortChange('position')}>
                Manual Order
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('priority')}>
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('category')}>
                Category
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('age')}>
                Age
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  );
}
