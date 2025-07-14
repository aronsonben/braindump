"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DndContext,
  DragEndEvent,
  DraggableAttributes,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { useToast } from "@/hooks/use-toast";
import { createCategory, deleteCategory, updateCategoryName } from "@/actions/actions";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Task, Category, Priority } from "@/lib/interface";
import { differenceInDays } from "date-fns/differenceInDays";


interface SortableRankItemProps {
  task: Task;
  children: (attributes: DraggableAttributes, listeners: SyntheticListenerMap | undefined) => React.ReactNode;
}

const SortableRankItem = ({ task, children, ...props }: SortableRankItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      id="sortable-rank-item"
      className="w-2/3 flex items-center justify-center mx-auto my-4 cursor-grab"
      {...attributes}
      {...listeners}
      key={task.id}
    >
      {children(attributes, listeners)}
    </div>
    );
}

function DraggableTask({ task }: { task: Task }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: `draggable-${task.id}`,
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };
  
  return (
    <Button
      ref={setNodeRef} 
      key={task.id}
      className="px-4 py-2 text-sm font-medium cursor-grab bg-white shadow-md hover:bg-amber-300 transition-shadow duration-200"
      style={style} 
      {...listeners} 
      {...attributes}
    >
      {task.title}
    </Button>
  );
}

interface DroppableRankSlotProps {
  slotOrder: string;
  children: React.ReactNode;
}

const DroppableRankSlot = ({ slotOrder, children }: DroppableRankSlotProps) => {
  const droppableId = `droppable-rank-slot-${slotOrder}`;
  const { setNodeRef } = useDroppable({
    id: droppableId,
  });

  return (
    <div 
      ref={setNodeRef} 
      className="w-full mx-8"
      aria-label="Droppable region"
    >
      {children}
    </div>
  );
}

interface DroppableRankListProps {
  droppables: any[];
  currentRankedTasks: Task[];
  currentSection: string;
  removeTask: (index: number) => void;
}

function DroppableRankList({ droppables, currentRankedTasks, currentSection, removeTask }: DroppableRankListProps) {

  return (
    <section>
      {droppables.map((id, index) => (
        <div key={id} className="w-full flex items-center justify-between mx-auto gap-4">
          <div className="w-full flex items-center justify-between gap-4">
            <div className="w-12 h-16 border border-gray-300 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">{index + 1}</span>
            </div>
            <DroppableRankSlot slotOrder={id} key={id}>
              <div className="w-full h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-between px-4">
                {currentRankedTasks[index] ? (
                  <>
                    <span className="text-gray-500">{currentRankedTasks[index].title}</span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeTask(index)}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span className="text-gray-500">Drag task here</span>
                )}
              </div>
            </DroppableRankSlot>
            <div className="w-28 h-16 rounded-lg flex items-center justify-center">
              {currentSection === "AGE" && currentRankedTasks[index] && (
                <span className="text-gray-500">
                  {differenceInDays(new Date(), new Date(currentRankedTasks[index].created_at))} days old
                </span>
              )}
              {currentSection === "PRIORITY" && currentRankedTasks[index] && (
                <span className="text-gray-500">Priority: {currentRankedTasks[index].priority}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </section>     
  );
}


export default function Rank({ tasks }: { tasks: Task[] }) {
  const RANK_SECTIONS = ["AGE", "PRIORITY", "SHININESS", "QUICK"];
  const [rankSection, setRankSection] = useState<string[]>(RANK_SECTIONS);
  const [currentRankSection, setCurrentRankSection] = useState<string>(RANK_SECTIONS[0]);
  const [rankedTasks, setRankedTasks] = useState<{ [key: string]: Task[] }>({});
  const [taskBank, setTaskBank] = useState<{ [key: string]: Task[] }>(
    rankSection.reduce((acc, section) => {
      acc[section] = tasks;
      return acc;
    }, {} as { [key: string]: Task[] })
  );
  const [slots, setSlots] = useState<{ [key: string]: number }>(
    rankSection.reduce((acc, section) => {
      acc[section] = 5;
      return acc;
    }, {} as { [key: string]: number })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const currentSection = rankSection[0];
    const currentRankedTasks = rankedTasks[currentSection] || [];
    const currentTaskBank = taskBank[currentSection] || [];

    // Remove the 'draggable-' prefix from the active.id
    const taskId = Number.parseInt(active.id.toString().replace('draggable-', ''));
    if (!taskId) return;

    const draggedTask = currentTaskBank.find((task) => task.id === taskId);
    if (!draggedTask) return;

    // Add task to ranked list and remove from Task Bank
    const updatedRankedTasks = [...currentRankedTasks, draggedTask];
    const updatedTaskBank = currentTaskBank.filter((task) => task.id !== taskId);

    setRankedTasks({ ...rankedTasks, [currentSection]: updatedRankedTasks });
    setTaskBank({ ...taskBank, [currentSection]: updatedTaskBank });
  };

  /** Handler to remove a task from a droppable slot in the current section
   * @param index - The index of the slot to remove the task from
   */
  const handleRemoveTaskFromSection = (index: number) => {
    // Initialize variables for current data
    const currentRankedTasks = rankedTasks[currentRankSection] || [];
    const currentTaskBank = taskBank[currentRankSection] || [];

    // First check that there is a task in the specified slot and that index is valid
    if (index < 0 || index >= currentRankedTasks.length) return;
    if (!currentRankedTasks[index]) return;

    // Get the task object of the task at the index in currentRankedTasks
    const taskToBeRemoved = currentRankedTasks[index];
    console.log("Removing from rank list: ", taskToBeRemoved);

    // Remove the task from the currentRankedTasks and slide all the rest of the tasks up one
    let updatedRankedTasks = currentRankedTasks.filter((_, i) => i !== index);
    updatedRankedTasks = updatedRankedTasks.map((task, i) => {
      if (i >= index) {
        // Slide the task up one position
        task.position = i;
      }
      return task;
    });

    // Return the removed task to the task bank
    const updatedTaskBank = [...currentTaskBank, taskToBeRemoved];

    // Update state
    setRankedTasks({...rankedTasks, [currentSection]: updatedRankedTasks });
    setTaskBank({...taskBank, [currentSection]: updatedTaskBank });
  }

  const handleLoadMoreSlots = () => {
    const currentSection = rankSection[0];
    setSlots({ ...slots, [currentSection]: slots[currentSection] + 5 });
  };

  const handleSubmit = () => {
    // Reset ranked tasks and Task Bank for all sections
    setRankedTasks({});
    setTaskBank(
      rankSection.reduce((acc, section) => {
        acc[section] = tasks;
        return acc;
      }, {} as { [key: string]: Task[] })
    );
    setSlots(
      rankSection.reduce((acc, section) => {
        acc[section] = 5;
        return acc;
      }, {} as { [key: string]: number })
    );
  };

  const currentSection = rankSection[0];
  const currentRankedTasks = rankedTasks[currentSection] || [];
  const currentTaskBank = taskBank[currentSection] || [];

  return (
    <div className="w-full max-w-5xl min-h-screen bg-background">
      <div className="w-full mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          {rankSection.map((section) => (
            <Button
              key={section}
              className={`px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-200 ${
                section === currentRankSection ? "bg-blue-500 text-white hover:bg-blue-300" : "text-gray-500"
              }`}
              onClick={() => setCurrentRankSection(section)}
            >
              {section}
            </Button>
          ))}
        </div>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={useSensors(
            useSensor(PointerSensor),
            useSensor(KeyboardSensor, {
              coordinateGetter: sortableKeyboardCoordinates,
            })
          )}
        >
            <div className="w-full flex items-center justify-between mx-auto my-4 gap-4">
              <span className="text-2xl font-bold">Rank</span>
              <span className="text-2xl font-bold">Task</span>
              <span className="text-2xl font-bold">Info</span>
            </div>

            <DroppableRankList 
              droppables={Array.from({ length: slots[currentSection] })}
              currentRankedTasks={currentRankedTasks} 
              currentSection={currentSection}
              removeTask={handleRemoveTaskFromSection}
            />
            
            <div className="w-full flex items-center justify-center mt-4">
              <Button variant="outline" className="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-200" onClick={handleLoadMoreSlots}>
                Load More Slots
              </Button>
            </div>
            <div className="my-8 cursor-grab grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentTaskBank.map((task) => (
                <DraggableTask key={task.id} task={task} />
              ))}
            </div>
        </DndContext>
        {rankSection.every((section) => rankedTasks[section]?.length === slots[section]) && (
          <div className="w-full flex items-center justify-center mt-4">
            <Button className="px-4 py-2 text-sm font-medium bg-amber-500 text-white" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}