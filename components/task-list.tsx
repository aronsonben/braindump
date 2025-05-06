"use client"

import { useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { changePriority, changeCategory } from '@/actions/actions';
import { Task, PriorityLevel, Category } from "@/lib/interface";
import { Flag, Archive, FolderOpen, Trash2, GripVertical } from "lucide-react";
// import { differenceInDays } from "date-fns";
// import { useToast } from "@/hooks/use-toast";

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  showAge?: boolean;
  showBacklogButton?: boolean;
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

export function TaskList({ tasks, categories, showAge = true, showBacklogButton = true }: TaskListProps) {
  // const { toast } = useToast();

  useEffect(() => {
    // This is a placeholder for any side effects you might want to run when tasks change
    // For example, you could fetch new data or update the UI
    console.log("Tasks updated:", tasks);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case PriorityLevel.HIGH:
        return "text-[hsl(10,65%,45%)]"; // Deep Rust
      case PriorityLevel.MEDIUM_HIGH:
        return "text-[hsl(25,70%,50%)]"; // Burnt Orange
      case PriorityLevel.MEDIUM:
        return "text-accent"; // Amber
      case PriorityLevel.MEDIUM_LOW:
        return "text-[hsl(80,25%,55%)]"; // Olive Green
      case PriorityLevel.LOW:
        return "text-secondary"; // Sage Green
      default:
        return "text-muted-foreground";
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over?.id);

      const newTasks = [...tasks];
      const [movedTask] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, movedTask);

      // Use the mutation to reorder tasks
      // reorderMutation.mutate(newTasks.map((task) => task.id));
      console.log(`Reordering tasks: ${newTasks.map((task) => task.id).join(", ")}`);
    }
  };

  const handlePriorityChange = async (id: number, priority: string) => {
    changePriority(id, priority);
  };

  const handleCategoryChange = (taskId: number, categoryId: number | null) => {
    console.log(`Changing category of task ${taskId} to ${categoryId}`);
    changeCategory(taskId, categoryId);
  };

  const handleMoveToBacklog = (id: number) => {
    console.log(`Moving task ${id} to backlog`);
    // backlogMutation.mutate(id);
  };

  const handleDeleteTask = (id: number) => {
    console.log(`Deleting task ${id}`);
    // deleteMutation.mutate(id);
  };

  return (
    <div className="border rounded-lg bg-white shadow-sm">
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
              items={tasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks.map((task) => {
                // const daysOld = differenceInDays(new Date(), new Date(task.createdAt));
                const daysOld = 1;
                const taskCategory = categories?.find(c => c.id === task.category_id);

                return (
                  <SortableTableRow key={task.id} task={task}>
                    {(attributes, listeners) => (
                      <>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="cursor-grab active:cursor-grabbing h-6 w-6"
                            {...attributes}
                            {...listeners}
                          >
                            <GripVertical className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{task.title}</TableCell>
                        {showAge && (
                          <TableCell className={`${getAgeColor(daysOld)} font-medium text-xs`}>
                            {daysOld} days
                          </TableCell>
                        )}
                        <TableCell>
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
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className={`font-medium text-xs ${getPriorityColor(task.priority)} cursor-pointer hover:bg-muted/50 rounded px-2 py-1 inline-flex items-center`}>
                                <Flag className="h-3 w-3 inline-block mr-1" />
                                {task.priority}
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem onClick={() => handlePriorityChange(task.id, PriorityLevel.HIGH)}>
                                <Flag className="h-4 w-4 mr-2 text-[hsl(10,65%,45%)]" />
                                High Priority
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePriorityChange(task.id, PriorityLevel.MEDIUM_HIGH)}>
                                <Flag className="h-4 w-4 mr-2 text-[hsl(25,70%,50%)]" />
                                Medium-High Priority
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePriorityChange(task.id, PriorityLevel.MEDIUM)}>
                                <Flag className="h-4 w-4 mr-2 text-accent" />
                                Medium Priority
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePriorityChange(task.id, "medium-low")}>
                                <Flag className="h-4 w-4 mr-2 text-[hsl(80,25%,55%)]" />
                                Medium-Low Priority
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePriorityChange(task.id, PriorityLevel.LOW)}>
                                <Flag className="h-4 w-4 mr-2 text-secondary" />
                                Low Priority
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTask(task.id)}
                              className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Delete task"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                            {showBacklogButton && daysOld > 7 && (
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
  );
}
