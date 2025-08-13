"use client"

import { useState } from "react";
import { useRouter, redirect } from 'next/navigation'
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SimpleUser } from "@/lib/interface";
import { createTasks } from "@/actions/actions";

interface BraindumpProps {
  user: SimpleUser;
}

export default function Braindump({ user }: BraindumpProps) {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    // first check if the user is signed in or not. if not, take to sign-up page.
    if (!user) {
      return redirect("/sign-up");
    } 

    // if user is signed in, create the tasks, save them to db, and take user to /go page
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
    <div className="w-full bg-background">
      <div className="w-full mx-auto px-4 py-8">
          <p className="text-muted-foreground mb-4">
            Write down everything that's on your mind, one task per line.
          </p>
            <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
`Buy groceries
Call dentist
Fix bike tire
...`}
            className="min-h-[300px] mb-4"
            />
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleSubmit} disabled={!input.trim()} className="cursor-pointer hover:bg-amber-100">
              Create Tasks
            </Button>
          </div>
      </div>
    </div>
  );
}
