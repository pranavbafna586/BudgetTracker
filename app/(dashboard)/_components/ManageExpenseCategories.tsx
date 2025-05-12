"use client";

import { Category } from "@/lib/generated/prisma/client";
import CategoryCardGrid from "./CategoryCardGrid";
import CreateCategoryDialog from "./CreateCategoryDialog";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  initialCategories: Category[];
  userId: string;
}

export default function ManageExpenseCategories({
  initialCategories,
  userId,
}: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);

  // Modified to use category name instead of id
  const handleRemove = async (categoryName: string) => {
    setIsLoading(true);
    try {
      // Find the category by name to get any additional data needed
      const categoryToDelete = categories.find(
        (cat) => cat.name === categoryName
      );
      if (!categoryToDelete) {
        throw new Error("Category not found");
      }

      // Encode the category name for URL safety
      const encodedName = encodeURIComponent(categoryName);

      const response = await fetch(
        `/api/categories/by-name/${encodedName}?userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete category");
      }

      // Filter by name correctly
      setCategories(categories.filter((cat) => cat.name !== categoryName));
      toast.success("Category removed successfully");
    } catch (error) {
      console.error("Error removing category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to remove category"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = (newCategory: Category) => {
    setCategories([...categories, newCategory]);
  };

  return (
    <div className="space-y-6">
      <CategoryCardGrid
        categories={categories}
        onRemove={handleRemove}
        type="expense"
      />

      <div className="pt-4">
        <CreateCategoryDialog
          type="expense"
          successCallback={handleAddCategory}
          trigger={
            <button className="w-full py-2 border-2 border-dashed border-rose-200 dark:border-rose-800 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
              + Add expense category
            </button>
          }
        />
      </div>
    </div>
  );
}
