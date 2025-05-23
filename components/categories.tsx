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
import { useToast } from "@/hooks/use-toast";
import { createCategory, deleteCategory, updateCategoryName } from "@/actions/actions";
import { Category } from "@/lib/interface";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";


export default function Categories({ categories: initialCategories }: {categories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [colorPickerId, setColorPickerId] = useState<number | null>(null);
  const { toast } = useToast();  

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      createCategory(newCategoryName, `#${Math.floor(Math.random()*16777215).toString(16)}`);

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
      deleteCategory(id);

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
    if (!trimmed || categories.find(c => c.id === id)?.name === trimmed) {
      handleEditCancel();
      return;
    }
    try {
      await updateCategoryName(id, trimmed);
      setCategories(categories.map(c => c.id === id ? { ...c, name: trimmed } : c));
      toast({
        title: "Category updated",
        description: "Category name has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error updating category",
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
      await supabase.from("categories").update({ color }).eq("id", id);
      setCategories(categories.map(c => c.id === id ? { ...c, color } : c));
      toast({
        title: "Category color updated",
        description: "Category color has been updated.",
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
    <div className="w-full max-w-5xl min-h-screen bg-background">
      <div className="w-full mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/go">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground bg-clip-text">
            Categories
          </h1>
        </div>

        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
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

        <div className="flex justify-between mb-2 mt-6">
        <p className="text-xs italic font-bold text-muted-foreground">Click on the category name to edit it. You can have a maximum of 10 categories.</p>
        <p className="hidden sm:flex text-xs text-gray-500">{categories.length} / 10 category</p>
        </div>

        {categories?.length === 0 ? (
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
                    {editingId === category.id ? (
                      <span className="inline-flex items-center gap-1 w-full">
                        <input
                          className="border rounded px-1 py-0.5 text-base bg-background focus:outline-none focus:ring-2 focus:ring-primary max-w-[100px] sm:max-w-[180px] truncate"
                          value={editingName}
                          autoFocus
                          onChange={handleEditChange}
                          onBlur={() => handleEditCancel()}
                          onKeyDown={e => {
                            if (e.key === "Enter") handleEditSave(category.id);
                            if (e.key === "Escape") handleEditCancel();
                          }}
                          style={{ minWidth: 80 }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="p-1"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => handleEditSave(category.id)}
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
                        onClick={() => handleStartEdit(category.id, category.name)}
                        onKeyDown={e => {
                          if (e.key === "Enter" || e.key === " ") handleStartEdit(category.id, category.name);
                        }}
                        role="button"
                        aria-label="Edit category name"
                        title={category.name}
                      >
                        {category.name}
                      </span>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {editingId === category.id ? (
                      <>
                        
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(category.id, category.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <input
                        id="color-picker"
                        type="color"
                        className="w-full h-2 rounded-full mt-2 border inline-block align-middle cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ backgroundColor: category.color }}
                        aria-label="Pick color"
                        value={category.color}
                        onClick={() => setColorPickerId(category.id)}
                        onChange={e => handleColorChange(category.id, e.target.value)}
                        onBlur={() => setColorPickerId(null)}
                      />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
