"use client"

import { useState } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PriorityLevel } from "@/lib/interface";

export default function BrainDump() {
  const [input, setInput] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    const tasks = input
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);

    try {
      // TODO: Replace with server action 
      // await Promise.all(
      //   tasks.map((title) =>
      //     fetch("POST", "/api/tasks", { 
      //       title, 
      //       priority: PriorityLevel.MEDIUM 
      //     })
      //   )
      // );

      toast({
        title: "Brain dump completed!",
        description: `${tasks.length} tasks have been created.`
      });

      // setLocation("/");
    } catch (error) {
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
              <Button variant="outline" onClick={() => redirect("/")}>
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
