import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Category } from "@shared/schema";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function Categories() {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await apiRequest("POST", "/api/categories", {
        name: newCategoryName,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color
      });

      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setNewCategoryName("");
      setIsDialogOpen(false);

      toast({
        title: "Category created",
        description: "New category has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error creating category",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/categories/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });

      toast({
        title: "Category deleted",
        description: "Category has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error deleting category",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
            Categories
          </h1>
        </div>

        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <div className="flex gap-4">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button onClick={handleCreateCategory}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : categories?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No categories yet. Create one to start organizing your tasks.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {categories?.map((category) => (
              <Card key={category.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {category.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div
                    className="w-full h-2 rounded-full mt-2"
                    style={{ backgroundColor: category.color }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
