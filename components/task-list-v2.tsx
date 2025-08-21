"use client"

import { useState, useEffect, useReducer } from "react";
import { useRouter } from "next/navigation";
import {
  Column,
  Table as TableV2,
  ColumnDef,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  RowData,
  createColumnHelper,
  Row,
} from '@tanstack/react-table'
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
import ToolbarDemo from "./ui/toolbar";
import { Checkbox } from "./ui/checkbox";
import { differenceInDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { changePriority, changeCategory, moveToBacklog, resumeTask, deleteTask, reorderTasks, updateTaskName, completeTask } from '@/actions/actions';
import { Task, PriorityLevel, Category, Priority } from "@/lib/interface";
import { Flag, Archive, FolderOpen, Trash2, GripVertical, Check, FolderPlus, FolderEdit, MoreHorizontal } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { sanitizeTask } from "@/lib/utils";
import { CheckboxIndicator } from "@radix-ui/react-checkbox";

const defaultData: Task[] = [
  {
    id: 1,
    user_id: "12341",
    title: "task",
    priority: 4,
    category_id: 1,
    in_backlog: false,
    completed: false,
    position: 1,
    created_at: new Date(),
    inserted_at: new Date(),
    last_reminded: new Date(),
  },
  {
    id: 2,
    user_id: "12341",
    title: "task2",
    priority: 4,
    category_id: 1,
    in_backlog: false,
    completed: false,
    position: 1,
    created_at: new Date(),
    inserted_at: new Date(),
    last_reminded: new Date(),
  },{
    id: 3,
    user_id: "12341",
    title: "task3",
    priority: 4,
    category_id: 1,
    in_backlog: false,
    completed: false,
    position: 1,
    created_at: new Date(),
    inserted_at: new Date(),
    last_reminded: new Date(),
  },
]

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  priorities: Priority[];
  showAge?: boolean;
  showBacklogButton?: boolean;
  showResumeButton?: boolean;
  onSortChange?: (sortBy: string) => void;
  currentSort?: string;
  bulkEditable?: boolean;
  selectedTaskIds?: number[];
  setSelectedTaskIds?: React.Dispatch<React.SetStateAction<number[]>>;
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

function RowActions({ task }: {task: Row<Task>}) {
  return (
    <div className="flex items-center gap-1">
      {/* <Button
        id="complete-button"
        variant="outline"
        size="icon"
        
        className={`h-6 w-6 text-muted-foreground hover:text-green-600 hover:bg-green-100 ${task.completed ? 'opacity-50 pointer-events-none' : ''}`}
        title="Mark as complete"
        disabled={task.completed}
      >
        <Check className="h-3 w-3" />
      </Button> */}
      <Button
        variant="outline"
        size="icon"
        
        className="h-6 w-6 text-xs py-0 text-muted-foreground hover:text-[#575e77] hover:bg-[#e0e3ee]"
        title="Move to backlog"
      >
        <Archive className="h-3 w-3" />
      </Button>
      <Button
        id="delete-button"
        variant="outline"
        size="icon"
        
        className="h-6 w-6 text-muted-foreground hover:text-red-600 hover:bg-red-100"
        title="Delete task"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        
        className="h-6 text-xs py-0 text-muted-foreground hover:bg-muted"
        title="Move to backlog"
      >
        <Archive className="h-3 w-3 mr-1" />
        Resume
      </Button>
    </div>
  )
}

export function TaskListV2({ 
  tasks, 
  categories, 
  priorities,
  showAge = true, 
  showBacklogButton = true, 
  showResumeButton = false,
  onSortChange,
  currentSort = 'position',
  bulkEditable = false,
  selectedTaskIds = [],
  setSelectedTaskIds = () => { /* no-op */ }
}: TaskListProps) {
  // const { toast } = useToast();
  const [data, _setData] = useState(() => [...tasks])
  const rerender = useReducer(() => ({}), {})[1]

  const columnHelper = createColumnHelper<Task>();
  const columns = [
    columnHelper.accessor(row => row.title, {
      id: 'title',
      cell: task => task.getValue(),
    }),
    {
      id: 'age',
      accessorFn: (task: Task) => (`${differenceInDays(new Date(), new Date(task.created_at))} days`),
    },
    columnHelper.accessor(row => row.category_id, {
      id: 'category',
      cell: task => ( categories?.find(c => c.id === task.getValue()) ? task.getValue() : ''),
    }),
    columnHelper.accessor(row => row.priority, {
      id: 'priority',
      cell: task => ( priorities?.find(p => p.id === task.getValue()) ? task.getValue() : ''),
    }),
    // Display Column
    columnHelper.display({
      id: 'actions',
      cell: props => <RowActions task={props.row} />,
    }),
  ]

  const table = useReactTable({
    columns,
    data,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <>
    <div className="border rounded-lg bg-primary shadow-sm">
      <table>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* <button onClick={() => rerender()} className="border p-2">
        Rerender
      </button> */}
    </div>
    </>
  );
}
