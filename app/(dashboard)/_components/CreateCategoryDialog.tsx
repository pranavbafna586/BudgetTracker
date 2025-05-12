"use client";
import { TransactionType } from "@/lib/types";
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
} from "@/schema/categories";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleOff, Loader2, PlusSquare } from "lucide-react";
import React, { useState, useCallback, use, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Category } from "@/lib/generated/prisma/client";
import { useTheme } from "next-themes";
interface Props {
  type: TransactionType;
  successCallback?: (category: Category) => void;
  // Optional props for external control
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

function CreateCategoryDialog({
  type,
  successCallback,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  trigger,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if we're in controlled or uncontrolled mode
  const isControlled =
    controlledOpen !== undefined && setControlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const form = useForm<CreateCategorySchemaType>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      type,
    },
  });
  const queryClient = useQueryClient();
  const theme = useTheme();
  const { mutate, isPending } = useMutation({
    mutationFn: createCategory,
    onSuccess: async (data: Category) => {
      form.reset({
        name: "",
        icon: "",
        type,
      });
      toast.success(`Category ${data.name} created successfully 🎉`, {
        id: "create-category",
      });
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      // Call successCallback if provided
      if (successCallback) {
        successCallback(data);
      }

      setOpen(false);
    },
    onError: (error: any) => {
      // Display a more specific error message if available
      const errorMessage = error.message || "Something went wrong";
      toast.error(errorMessage, {
        id: "create-category",
      });
      console.error("Category creation error:", error);
    },
  });

  const onSubmit = useCallback(
    (values: CreateCategorySchemaType) => {
      toast.loading("Creating category...", {
        id: "create-category",
      });
      mutate(values);
    },
    [mutate]
  );

  // Reset form when type changes
  useEffect(() => {
    form.reset({
      name: "",
      icon: "",
      type,
    });
  }, [type, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground"
          >
            <PlusSquare className="mr-2 h-4 w-4" /> Create new
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md md:max-w-lg w-[95vw] mx-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl sm:text-2xl">
            Create{" "}
            <span
              className={
                type === "income"
                  ? "text-emerald-500 font-medium"
                  : "text-red-500 font-medium"
              }
            >
              {type}
            </span>{" "}
            category
          </DialogTitle>
          <DialogDescription className="max-w-xs mx-auto">
            Categories are used to group your transactions
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="px-1">
                  <FormLabel className="text-base">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Category name"
                      value={field.value || ""}
                      onChange={field.onChange}
                      className="h-11"
                    />
                  </FormControl>
                  <FormDescription className="text-sm">
                    Transaction description (optional)
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem className="px-1">
                  <FormLabel className="text-base">Icon</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="h-[100px] w-full rounded-lg border-dashed hover:bg-muted/50 transition-all"
                        >
                          {field.value ? (
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-5xl" role="img">
                                {field.value}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                Click to change
                              </p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <CircleOff className="h-[48px] w-[48px] text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">
                                Click to select
                              </p>
                            </div>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full max-w-[95vw] md:max-w-md mx-auto">
                        <Picker
                          data={data}
                          theme={theme.resolvedTheme}
                          onEmojiSelect={(emoji: { native: string }) => {
                            field.onChange(emoji.native);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormDescription className="text-sm text-center">
                    This is how your category will appear in the app
                  </FormDescription>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 pt-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant={"secondary"}
              onClick={() => {
                form.reset();
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <span className="mr-2">Creating...</span>
                <Loader2 className="h-4 w-4 animate-spin" />
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCategoryDialog;

async function createCategory(
  variables: CreateCategorySchemaType
): Promise<Category> {
  try {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variables),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("API Error:", responseData);
      throw new Error(responseData.error || "Failed to create category");
    }

    return responseData;
  } catch (error) {
    console.error("Create category error:", error);
    throw error;
  }
}
