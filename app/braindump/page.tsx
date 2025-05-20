"use client"

import { useState } from "react";
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createTasks } from "@/actions/actions";

export default function BrainDump() {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    const newTasks = input
      .split("\n")
      .map(line => line.trim())
      .filter(line => line !== null) as string[];

    if (newTasks.length === 0) {
      toast({
        title: "No valid tasks",
        description: "Please enter at least one valid task",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("Creating tasks:", newTasks);
      await createTasks(newTasks);
  
      toast({
        title: "Brain dump completed!",
        description: `${newTasks.length} tasks have been created.`
      });
  
      console.log("back to go");
      router.push("/go");
    } catch (error) {
      console.error("Error creating tasks:", error);
      toast({
        title: "Error creating tasks",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground mb-4">
            Write down everything that's on your mind, one task per line. Don't worry about order - you can set priorities later.
          </p>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Buy groceries&#10;Call dentist&#10;Fix bike tire&#10;..."
            className="min-h-[300px] mb-4"
          />
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.push("/go")}>
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSubmit} disabled={!input.trim()}>
              Create Tasks
            </Button>
          </div>
      </div>
    </div>
  );
}
