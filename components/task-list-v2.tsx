"use client"

import { useState, useEffect, useReducer, useRef, useCallback } from "react";
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
  CellContext,
} from '@tanstack/react-table'
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
import {
  changePriority,
  changeCategory,
  moveToBacklog,
  resumeTask,
  deleteTask,
  reorderTasks,
  updateTaskName,
  completeTask,
} from "@/actions/actions";
import {
  Task,
  PriorityLevel,
  Category,
  Priority,
} from "@/lib/interface";
import {
  Flag,
  Archive,
  FolderOpen,
  Trash2,
  GripVertical,
  Check,
  FolderPlus,
  FolderEdit,
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
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
    category_name: "music",
    priority_name: ""
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
    category_name: "",
    priority_name: "high"
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
    category_name: "",
    priority_name: ""
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

/*******************************
 * From Tanstack Example :::
 * ***************************** */
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

interface defaultCellBehaviorProps {
  getValue: () => unknown;
  index: number;
  id: string;
  table: TableV2<Task>
}

function DefaultCellBehavior({ getValue, index, id, table }: defaultCellBehaviorProps) {
  const initialValue = getValue()
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue)

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    table.options.meta?.updateData(index, id, value)
  }

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <input
      value={value as string}
      onChange={e => setValue(e.target.value)}
      onBlur={onBlur}
    />
  )
}

// Give our default column cell renderer editing superpowers!
const defaultColumn: Partial<ColumnDef<Task>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => DefaultCellBehavior({getValue, index, id, table}),
}

/** This is for use with Pagination... not relevant at this moment (8/25) */
function useSkipper() {
  const shouldSkipRef = useRef(true)
  const shouldSkip = shouldSkipRef.current

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
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
  const { toast } = useToast();
  const [data, setData] = useState(() => [...tasks])
  // Track which row is being edited for category or priority
  const [editingCategoryRowId, setEditingCategoryRowId] = useState<number | null>(null);
  const [editingPriorityRowId, setEditingPriorityRowId] = useState<number | null>(null);
  // const [data, setData] = React.useState(() => makeData(1000))
  const rerender = useReducer(() => ({}), {})[1]

  const columnHelper = createColumnHelper<Task>();
  const columns = [
    {
      id: 'title',
      accessorFn: (task: Task) => task.title,
    },
    columnHelper.accessor('created_at', {
      header: () => 'age',
      cell: (task) => (`${differenceInDays(new Date(), new Date(task.getValue()))} days`)
    }),
    {
      id: 'category',
      header: 'category',
      cell: ({ row }: { row: Row<Task> }) => {
        const task = row.original;
        const isEditing = editingCategoryRowId === task.id;
        if (isEditing) {
          return (
            <DropdownMenu open onOpenChange={(open) => { if (!open) setEditingCategoryRowId(null); }}>
              <DropdownMenuTrigger asChild>
                <span
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setEditingCategoryRowId(task.id)}
                  onKeyDown={e => { if (e.key === 'Enter') setEditingCategoryRowId(task.id); }}
                  className="w-full flex items-center justify-between mr-2 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {task.category_name}
                  <span className="ml-1"><ChevronDown strokeWidth={4} className="h-3 w-3 mr-2"/></span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom" sideOffset={4} className="min-w-[8rem]">
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onSelect={async () => {
                      if (cat.id !== task.category_id) {
                        // Optimistic update
                        const prevCategoryId = task.category_id;
                        const prevCategoryName = task.category_name;
                        setData((prev) => prev.map(t => t.id === task.id ? { ...t, category_id: cat.id, category_name: cat.name } : t));
                        setEditingCategoryRowId(null);
                        try {
                          await changeCategory(task.id, cat.id);
                        } catch (err: any) {
                          // Revert on error
                          setData((prev) => prev.map(t => t.id === task.id ? { ...t, category_id: prevCategoryId, category_name: prevCategoryName } : t));
                          toast({ title: 'Failed to update category', description: err?.message || 'An error occurred.' });
                        }
                        return;
                      }
                      setEditingCategoryRowId(null);
                    }}
                    className={cat.id === task.category_id ? 'font-semibold bg-amber-100' : ''}
                  >
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        } 
        return (
          <span
            tabIndex={0}
            style={{ cursor: 'pointer', width: '100%' }}
            onClick={() => setEditingCategoryRowId(task.id)}
            onKeyDown={e => { if (e.key === 'Enter') setEditingCategoryRowId(task.id); }}
            className="w-full flex items-center justify-between mr-2 max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {task.category_name || <span>&nbsp;</span>}
            <span className="ml-1"><ChevronDown className="h-3 w-3 mr-2"/></span>
          </span>
        );
      },
    },
    {
      id: 'priority',
      header: 'priority',
      cell: ({ row }: { row: Row<Task> }) => {
        const task = row.original;
        const isEditingPriority = editingPriorityRowId === task.id;
        if (isEditingPriority) {
          return (
            <DropdownMenu open onOpenChange={(open) => { if (!open) setEditingPriorityRowId(null); }}>
              <DropdownMenuTrigger asChild>
                <span
                  tabIndex={0}
                  onClick={() => setEditingPriorityRowId(task.id)}
                  onKeyDown={e => { if (e.key === 'Enter') setEditingPriorityRowId(task.id); }}
                  className="w-full max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ 
                    cursor: 'pointer', 
                    display: 'block', 
                    width: '100%', 
                  }}
                >
                  {task.priority_name}
                  <span className="ml-1"><ChevronDown className="h-3 w-3 mr-2"/></span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="bottom" sideOffset={4} className="min-w-[8rem]">
                {priorities.map((priority) => (
                  <DropdownMenuItem
                    key={priority.id}
                    onSelect={async () => {
                      if (priority.id !== task.priority) {
                        // Optimistic update
                        const prevPriorityId = task.priority;
                        const prevPriorityName = task.priority_name;
                        setData((prev) => prev.map(t => t.id === task.id ? { ...t, priority_id: priority.id, priority_name: priority.name } : t));
                        setEditingPriorityRowId(null);
                        try {
                          await changePriority(task.id, priority.id);
                        } catch (err: any) {
                          // Revert on error
                          setData((prev) => prev.map(t => t.id === task.id ? { ...t, priority: prevPriorityId, priority_name: prevPriorityName } : t));
                          toast({ title: 'Failed to update priority', description: err?.message || 'An error occurred.' });
                        }
                        return;
                      }
                      setEditingPriorityRowId(null);
                    }}
                    className={priority.id === task.priority ? 'font-semibold bg-amber-100' : ''}
                  >
                    {priority.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        return (
          <span
            tabIndex={0}
            title={task.priority_name || ''}
            onClick={() => setEditingPriorityRowId(task.id)}
            onKeyDown={e => { if (e.key === 'Enter') setEditingPriorityRowId(task.id); }}
            className="w-full max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap"
            style={{ 
              cursor: 'pointer', 
              display: 'block', 
              width: '100%', 
            }}
          >
            {task.priority_name || <span>&nbsp;</span>}
          </span>
        );
      },
    },
    // Display Column
    columnHelper.display({
      id: 'actions',
      cell: props => <RowActions task={props.row} />, 
    }),
  ]

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper()

  const table = useReactTable({
    columns,
    data,
    defaultColumn,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex()
        console.log("Trying to updateData for: ", columnId);
        if(columnId === "title") {
          console.log("Updating title for: ", rowIndex, " with: ", value);
          // Get id for the task at rowIndex
          const taskId = table.getRowModel().rows[rowIndex]?.original.id;
          console.log("task id is: ", taskId);
          updateTaskName(taskId, value as string);
        }
        else if (columnId === "category") {
          console.log("Should show a dropdown & then update accordingly");
        }
      },
    },
  })

  return (
    <>
    <div className="px-2 border rounded-lg bg-primary shadow-sm overflow-scroll">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="py-2 pl-2 text-base text-left">
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
            <tr key={row.id} className="py-2">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="py-1 text-left">
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
