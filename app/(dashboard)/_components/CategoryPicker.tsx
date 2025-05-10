"use client";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import { PopoverTrigger } from "@/components/ui/popover";
import { Category } from "@/lib/generated/prisma/client";
import { TransactionType } from "@/lib/types";
import { Popover, PopoverContent } from "@radix-ui/react-popover";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import CreateCategoryDialog from "@/app/(dashboard)/_components/CreateCategoryDialog";

interface Props {
  type: TransactionType;
  value?: string;
  onChange?: (value: string) => void;
}

function CategoryPicker({ type, value: propValue, onChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(propValue || "");

  // Update local state when prop changes
  React.useEffect(() => {
    if (propValue !== undefined) {
      setValue(propValue);
    }
  }, [propValue]);

  const categoriesQuery = useQuery({
    queryKey: ["categories", type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((res) => res.json()),
  });

  const selectedCategory = categoriesQuery.data?.find(
    (category: Category) => category.name === value
  ); // Handle selection of a category
  const handleSelectCategory = (categoryName: string) => {
    setValue(categoryName);
    if (onChange) {
      onChange(categoryName);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedCategory ? (
            <CategoryRow category={selectedCategory} />
          ) : (
            "Select a category"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <CommandInput placeholder="Search category..." />
          {categoriesQuery.data?.map((category: Category) => (
            <div
              key={`${category.name}-${category.type}`}
              className="px-2 py-1 cursor-pointer hover:bg-slate-100"
              onClick={() => handleSelectCategory(category.name)}
            >
              <CategoryRow category={category} />
            </div>
          ))}
          <CreateCategoryDialog type={type} />
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default CategoryPicker;

function CategoryRow({ category }: { category: Category }) {
  return (
    <div className="flex item-center gap-2">
      <span role="img">{category.icon}</span>
      <span>{category.name}</span>
    </div>
  );
}
