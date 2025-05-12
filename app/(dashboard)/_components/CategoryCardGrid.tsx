"use client";

import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Category } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryCardGridProps {
  categories: Category[];
  onRemove: (categoryId: string) => void;
  type: "income" | "expense";
}

export default function CategoryCardGrid({
  categories,
  onRemove,
  type,
}: CategoryCardGridProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const openConfirmDialog = (name: string) => {
    setCategoryToDelete(name);
    setConfirmDialogOpen(true);
  };

  const handleRemove = async (name: string) => {
    if (!name) {
      console.error("Category name is missing");
      return;
    }

    setIsDeleting(name);
    try {
      await onRemove(name);
    } catch (error) {
      console.error("Error in CategoryCardGrid handleRemove:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-1">
        {categories.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 md:col-span-3 text-center py-8 text-muted-foreground">
            No categories found. Create one to get started.
          </div>
        ) : (
          categories.map((category) => (
            <Card
              key={category.name} // Using name as the key instead of id
              className={cn(
                "flex flex-col items-center p-4 hover:shadow-md transition-all border",
                type === "income"
                  ? "hover:border-emerald-200"
                  : "hover:border-rose-200"
              )}
            >
              <div className="flex flex-col items-center justify-between h-full w-full">
                <div className="flex flex-col items-center flex-grow mb-4">
                  <div className="text-4xl my-3">{category.icon || "🔹"}</div>
                  <h3 className="font-medium text-center mt-2 line-clamp-2">
                    {category.name}
                  </h3>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className={cn(
                    "w-full mt-auto text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-t",
                    "text-red-600 hover:text-red-700"
                  )}
                  onClick={() => openConfirmDialog(category.name)} // Open confirm dialog instead of direct removal
                  disabled={isDeleting === category.name}
                >
                  {isDeleting === category.name ? (
                    "Removing..."
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this category?
              {categoryToDelete && (
                <span className="block mt-2 font-medium">
                  "{categoryToDelete}"
                </span>
              )}
              <span className="block mt-2 text-amber-500">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              className="mt-0"
              onClick={() => setCategoryToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                "bg-red-500 hover:bg-red-600",
                type === "income" ? "text-white" : "text-white"
              )}
              onClick={() => {
                if (categoryToDelete) {
                  handleRemove(categoryToDelete);
                  setCategoryToDelete(null);
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
