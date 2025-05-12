"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { Category } from "@/lib/generated/prisma/client";
import { transactionCategories, transactionTypes } from "../data/data";

interface CategoryWithIcon {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CategoryContextType {
  databaseCategories: Category[];
  categories: CategoryWithIcon[];
  loading: boolean;
}

const CategoryContext = createContext<CategoryContextType>({
  databaseCategories: [],
  categories: [],
  loading: true,
});

export function useCategories() {
  return useContext(CategoryContext);
}

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [databaseCategories, setDatabaseCategories] = useState<Category[]>([]);
  const [categories, setCategories] = useState<CategoryWithIcon[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/categories?_=${timestamp}`);

        if (!response.ok) {
          console.warn("Categories API returned an error, using fallback data");
          setCategories(transactionCategories);
          return;
        }

        const data: Category[] = await response.json();
        console.log("Categories fetched:", data.length);
        setDatabaseCategories(data);

        // Map database categories to the format needed for the filter component
        const mappedCategories: CategoryWithIcon[] = data.map((cat) => {
          // Find icon from predefined list or use default
          const matchingIcon =
            transactionCategories.find(
              (tc) => tc.value === cat.name.toLowerCase()
            )?.icon ||
            (cat.type === "income"
              ? transactionTypes[0].icon
              : transactionTypes[1].icon);

          return {
            label: cat.name,
            value: cat.name,
            icon: matchingIcon,
          };
        });

        setCategories(
          mappedCategories.length > 0 ? mappedCategories : transactionCategories
        );
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories(transactionCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <CategoryContext.Provider
      value={{ databaseCategories, categories, loading }}
    >
      {children}
    </CategoryContext.Provider>
  );
}
