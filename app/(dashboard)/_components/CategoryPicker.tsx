"use client";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Category } from "@/lib/generated/prisma/client";
import { TransactionType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback } from "react";
import CreateCategoryDialog from "@/app/(dashboard)/_components/CreateCategoryDialog";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";

interface Props {
  type: TransactionType;
  value?: string;
  onChange?: (value: string) => void;
  successCallback?: (category: Category) => void;
}

function CategoryPicker({
  type,
  successCallback,
  value: propValue,
  onChange,
}: Props) {
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
  );

  // Handle selection of a category
  const handleSelectCategory = useCallback(
    (categoryName: string) => {
      setValue(categoryName);
      if (onChange) {
        onChange(categoryName);
      }
      setOpen(false);
    },
    [onChange, setOpen]
  );

  // Handle newly created category
  const handleCategoryCreated = useCallback(
    (category: Category) => {
      // Set the newly created category as selected
      setValue(category.name);
      if (onChange) {
        onChange(category.name);
      }

      // Call the provided success callback if it exists
      if (successCallback) {
        successCallback(category);
      }
    },
    [onChange, successCallback]
  );

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
            "Select category"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <CommandInput placeholder="Search category..." />

          <CreateCategoryDialog
            type={type}
            successCallback={handleCategoryCreated}
          />
          <CommandEmpty>
            <p>Category not found</p>
            <p className="text-xs text-muted-foreground">
              Tip: Create a new category
            </p>
          </CommandEmpty>
          <CommandGroup>
            <CommandList>
              {categoriesQuery.data &&
                categoriesQuery.data?.map((category: Category) => (
                  <CommandItem
                    key={category.name}
                    onSelect={() => handleSelectCategory(category.name)}
                  >
                    <CategoryRow category={category} />
                    <div
                      className={cn(
                        "mx-2 w-4 h-4 opacity-0",
                        value === category.name && "opacity-100"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandList>
          </CommandGroup>
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
