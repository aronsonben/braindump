"use client"

import { useState } from "react";
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createTasks } from "@/actions/actions";
import { PriorityLevel } from "@/lib/interface";
import { sanitizeTask } from "@/lib/utils";

export default function BrainDump() {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    const sanitizedTasks = input
      .split("\n")
      .map(line => sanitizeTask(line.trim()))
      .filter(line => line !== null) as string[];

      if (sanitizedTasks.length === 0) {
        toast({
          title: "No valid tasks",
          description: "Please enter at least one valid task",
          variant: "destructive"
        });
        return;
      }

      try {
        console.log("Creating tasks:", sanitizedTasks);
        createTasks(sanitizedTasks);
    
        toast({
          title: "Brain dump completed!",
          description: `${sanitizedTasks.length} tasks have been created.`
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
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
          Brain Dump
        </h1>

        <Card className="mb-6">
          <CardContent className="p-6">
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
              <Button variant="outline" onClick={() => router.push("/")}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!input.trim()}>
                Create Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
