"use client";
import React from "react";
import { TransactionType } from "@/lib/types";
import { ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "@/schema/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CategoryPicker from "./CategoryPicker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Transaction } from "@/lib/generated/prisma/client";

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}

function CreateTransactionDialog({ trigger, type }: Props) {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      date: new Date(),
      category: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: createTransaction,
    onSuccess: async (data: Transaction) => {
      form.reset({
        type,
        date: new Date(),
        category: "",
        description: "",
        amount: undefined,
      });
      toast.success(`Transaction created successfully 🎉`, {
        id: "create-transaction",
      });
      await queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });

      setOpen(false);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Something went wrong";
      toast.error(errorMessage, {
        id: "create-transaction",
      });
      console.error("Transaction creation error:", error);
    },
  });

  const onSubmit = (values: CreateTransactionSchemaType) => {
    toast.loading("Creating transaction...", {
      id: "create-transaction",
    });
    mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create a new{" "}
            <span
              className={cn(
                "m-1",
                type === "income" ? "text-emerald-500" : "text-rose-500"
              )}
            >
              {type}
            </span>
            transaction
          </DialogTitle>{" "}
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>{" "}
                  <FormControl>
                    <Input
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Transaction description (optional)
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>{" "}
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Transaction amount (required)
                  </FormDescription>
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category</FormLabel>{" "}
                    <FormControl>
                      <CategoryPicker
                        type={type}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Select a category for this transaction
                    </FormDescription>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Transaction date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Select a date for this transaction
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Save transaction"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateTransactionDialog;

async function createTransaction(
  variables: CreateTransactionSchemaType
): Promise<Transaction> {
  try {
    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(variables),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("API Error:", responseData);
      throw new Error(responseData.error || "Failed to create transaction");
    }

    return responseData;
  } catch (error) {
    console.error("Create transaction error:", error);
    throw error;
  }
}
