"use client"

import { useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createPriority, deletePriority, reorderPriorities, updatePriorityName } from "@/actions/actions";
import { Priority } from "@/lib/interface";
import { ArrowLeft, GripVertical, Plus, Trash2, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DraggableAttributes,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { createClient } from "@/utils/supabase/client";

interface SortableTableRowProps {
  priority: Priority;
  children: (attributes: DraggableAttributes, listeners: SyntheticListenerMap | undefined) => React.ReactNode;
}

function SortableRow({priority, children, ...props}: SortableTableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: priority.id });

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

export default function Priorities({ priorities: initialPriorities }: {priorities: Priority[] }) {
  const [newPriorityName, setNewPriorityName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [priorities, setPriorities] = useState(initialPriorities.sort((a, b) => a.order - b.order));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [colorPickerId, setColorPickerId] = useState<number | null>(null);
  const { toast } = useToast();  

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // Fetch latest priorities from Supabase
  const fetchPriorities = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("priorities")
      .select("*")
      .order("order", { ascending: true });
    if (!error && data) {
      setPriorities(data);
    }
  };

  const handleCreatePriority = async () => {
    if (!newPriorityName.trim() || priorities.length >= 10) return;
    setIsCreating(true);
    try {
      // Create and get the new priority row
      const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      const result = await createPriority(newPriorityName, color);
      // Optimistically add to local state if result returns the new row
      if (result && result[0]) {
        setPriorities(prev => [...prev, result[0]].sort((a, b) => a.order - b.order));
      }
      setNewPriorityName("");
      setIsDialogOpen(false);
      toast({
        title: "Priority created",
        description: "New priority has been added successfully.",
      });
      // Refetch from backend to ensure sync
      await fetchPriorities();
    } catch (error) {
      toast({
        title: "Error creating priority",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePriority = async (id: number) => {
    try {
      deletePriority(id);

      toast({
        title: "Priority deleted",
        description: "Priority has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error deleting priority",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;
    if (!over || active.id === over.id) return;
    const oldIndex = priorities.findIndex((p) => p.id === active.id);
    const newIndex = priorities.findIndex((p) => p.id === over.id);
    const newPriorities = arrayMove(priorities, oldIndex, newIndex).map((p, idx) => ({...p, order: idx}));
    setPriorities(newPriorities);
    try {
      await reorderPriorities(newPriorities.map(p => ({id: p.id, order: p.order})));
    } catch (error) {
      toast({
        title: 'Error reordering priorities',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleStartEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleEditSave = async (id: number) => {
    const trimmed = editingName.trim();
    if (!trimmed || priorities.find(p => p.id === id)?.name === trimmed) {
      handleEditCancel();
      return;
    }
    try {
      await updatePriorityName(id, trimmed);
      setPriorities(priorities.map(p => p.id === id ? { ...p, name: trimmed } : p));
      toast({
        title: "Priority updated",
        description: "Priority name has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error updating priority",
        description: "Please try again",
        variant: "destructive",
      });
    }
    handleEditCancel();
  };

  // Update color handler
  const handleColorChange = async (id: number, color: string) => {
    try {
      const supabase = createClient();
      await supabase.from("priorities").update({ color }).eq("id", id);
      setPriorities(priorities.map(p => p.id === id ? { ...p, color } : p));
      toast({
        title: "Priority color updated",
        description: "Priority color has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error updating color",
        description: "Please try again",
        variant: "destructive",
      });
    }
    setColorPickerId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
          <Link href="/go">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground bg-clip-text mr-2">
            Priorities
          </h1>
          </div>
          <div className="hidden sm:flex"> {/* This button is hidden on small screens */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2" disabled={priorities.length >= 10}>
                  <Plus className="h-5 w-5" />
                  New Priority
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Priority</DialogTitle>
                </DialogHeader>
                <div className="flex gap-4">
                  <Input
                    placeholder="Priority name"
                    value={newPriorityName}
                    onChange={(e) => setNewPriorityName(e.target.value)}
                  />
                  <Button onClick={handleCreatePriority} disabled={isCreating || !newPriorityName.trim() || priorities.length >= 10}>
                    {isCreating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex justify-between mb-2 mt-6">
        <p className="text-xs italic font-bold text-muted-foreground">Click on the priority name to edit it. You can have a maximum of 10 priorities.</p>
        <p className="hidden sm:flex text-xs text-gray-500">{priorities.length} / 10 priorities</p>
        </div>
        <div className="border rounded-lg bg-primary shadow-sm">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-foreground text-left w-full">Name</TableHead>
                    <TableHead className="font-semibold text-foreground text-left w-32 sm:w-40 text-nowrap">Color</TableHead>
                    <TableHead className="font-semibold text-foreground w-20 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext
                    items={priorities.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                  {priorities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No priorities yet. Create one to start organizing your tasks.
                      </TableCell>
                    </TableRow>
                  ) : (
                    priorities.map((priority) => (
                      <SortableRow
                        key={priority.id}
                        priority={priority}
                      >
                        {(attributes: DraggableAttributes, listeners: SyntheticListenerMap | undefined) => (
                          <>
                            <TableCell id="priority-name-cell" className="font-semibold cursor-move select-none text-left max-w-[160px] sm:max-w-[240px] truncate">
                              <div className="flex items-center h-full min-w-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="cursor-grab active:cursor-grabbing h-6 w-6 mr-2"
                                  {...attributes}
                                  {...listeners}
                                >
                                  <GripVertical className="h-3 w-3 text-muted-foreground" />
                                </Button>
                                {editingId === priority.id ? (
                                  <span className="inline-flex items-center gap-1 w-full">
                                    <input
                                      className="border rounded px-1 py-0.5 text-base bg-background focus:outline-none focus:ring-2 focus:ring-primary max-w-[100px] sm:max-w-[180px] truncate"
                                      value={editingName}
                                      autoFocus
                                      onChange={handleEditChange}
                                      onBlur={() => handleEditCancel()}
                                      onKeyDown={e => {
                                        if (e.key === "Enter") handleEditSave(priority.id);
                                        if (e.key === "Escape") handleEditCancel();
                                      }}
                                      style={{ minWidth: 80 }}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="p-1"
                                      onMouseDown={e => e.preventDefault()}
                                      onClick={() => handleEditSave(priority.id)}
                                      aria-label="Save"
                                    >
                                      <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 8.5l3 3 5-5"/></svg>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="p-1"
                                      onMouseDown={e => e.preventDefault()}
                                      onClick={handleEditCancel}
                                      aria-label="Cancel"
                                    >
                                      <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 5l6 6m0-6l-6 6"/></svg>
                                    </Button>
                                  </span>
                                ) : (
                                  <span
                                    className="cursor-pointer truncate block max-w-full"
                                    tabIndex={0}
                                    onClick={() => handleStartEdit(priority.id, priority.name)}
                                    onKeyDown={e => {
                                      if (e.key === "Enter" || e.key === " ") handleStartEdit(priority.id, priority.name);
                                    }}
                                    role="button"
                                    aria-label="Edit priority name"
                                    title={priority.name}
                                  >
                                    {priority.name}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell id="priority-color-cell" className="text-left w-20 sm:w-40 pr-0 sm:pr-4">
                              <div className="flex justify-end sm:justify-start items-center relative">
                                <input
                                  id="color-picker"
                                  type="color"
                                  className="w-8 h-4 rounded-full border inline-block align-middle cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                                  style={{ backgroundColor: priority.color }}
                                  aria-label="Pick color"
                                  value={priority.color}
                                  onClick={() => setColorPickerId(priority.id)}
                                  onChange={e => handleColorChange(priority.id, e.target.value)}
                                  onBlur={() => setColorPickerId(null)}
                                />
                                <span className="ml-2 text-xs text-muted-foreground align-middle hidden sm:inline">{priority.color}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePriority(priority.id)}
                                aria-label="Delete priority"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </>
                        )}
                      </SortableRow>
                    ))
                  )}
                  </SortableContext>
                </TableBody>
              </Table>
          </DndContext>
        </div>
        <p className="flex justify-end-safe sm:invisible text-xs text-gray-500 mt-2">{priorities.length} / 10 priorities</p>
        <div className="flex sm:hidden my-4 items-end justify-end"> {/* This button is hidden on small screens */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2" disabled={priorities.length >= 10}>
                  <Plus className="h-5 w-5" />
                  New Priority
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Priority</DialogTitle>
                </DialogHeader>
                <div className="flex gap-4">
                  <Input
                    placeholder="Priority name"
                    value={newPriorityName}
                    onChange={(e) => setNewPriorityName(e.target.value)}
                  />
                  <Button onClick={handleCreatePriority} disabled={isCreating || !newPriorityName.trim() || priorities.length >= 10}>
                    {isCreating ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
      </div>
    </div>
  );
}
