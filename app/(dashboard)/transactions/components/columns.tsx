"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  ShoppingBag,
  Utensils,
  Home,
  Car,
  HeartPulse,
  Landmark,
  GraduationCap,
  Plane,
  ShoppingCart,
  Briefcase,
  Gift,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/app/(dashboard)/transactions/components/data-table-column-header";
import { DataTableRowActions } from "@/app/(dashboard)/transactions/components/data-table-row-actions";
import { Transaction } from "../data/schema";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  transactionCategories,
  transactionTypes,
} from "@/app/(dashboard)/transactions/data/data";

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] border-gray-600 bg-gray-800/50"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const categoryName = row.getValue("category") as string;
      const categoryIcon = (row.original as any).categoryIcon;
      const type = row.getValue("type") as string;

      // Try to find a matching icon from our predefined list
      const iconComponent = (() => {
        if (!categoryIcon) return null;

        // Find the icon by name
        const iconMap: Record<string, any> = {
          ShoppingCart: ShoppingCart,
          Utensils: Utensils,
          Home: Home,
          Car: Car,
          HeartPulse: HeartPulse,
          Landmark: Landmark,
          GraduationCap: GraduationCap,
          Plane: Plane,
          ShoppingBag: ShoppingBag,
          Briefcase: Briefcase,
          Gift: Gift,
          Wallet: Wallet,
          ArrowUpRight: ArrowUpRight,
          ArrowDownLeft: ArrowDownLeft,
        };

        const IconComponent = iconMap[categoryIcon];
        if (IconComponent) {
          return (
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
                type === "income" ? "bg-emerald-900/60" : "bg-rose-900/60"
              }`}
            >
              <IconComponent
                className={`h-4 w-4 ${
                  type === "income" ? "text-emerald-300" : "text-rose-300"
                }`}
              />
            </div>
          );
        }
        return (
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
              type === "income" ? "bg-emerald-900/60" : "bg-rose-900/60"
            }`}
          >
            <span
              className={`${
                type === "income" ? "text-emerald-300" : "text-rose-300"
              } font-medium`}
            >
              {categoryIcon.charAt(0)}
            </span>
          </div>
        );
      })();
      return (
        <div className="flex items-center">
          {iconComponent}
          <span className="font-medium text-white">{categoryName}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div
          className="max-w-[300px] truncate hover:text-clip hover:overflow-visible"
          title={description}
        >
          <span className="font-medium text-white">{description}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      const formattedDate = formatDate(date);

      // Extract day and month for visual emphasis
      let day, month;
      try {
        const dateObj = new Date(date);
        day = dateObj.getDate();
        month = dateObj.toLocaleString("default", { month: "short" });
      } catch (e) {
        day = "--";
        month = "---";
      }

      return (
        <div className="flex items-center">
          <div className="flex flex-col items-center justify-center mr-3 w-10 h-10 rounded-md border border-gray-700 bg-gray-800">
            <span className="text-xs text-gray-400 uppercase">{month}</span>
            <span className="text-sm font-bold text-gray-100">{day}</span>
          </div>
          <div className="text-gray-300 text-sm">{formattedDate}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = transactionTypes.find(
        (type) => type.value === row.getValue("type")
      );
      if (!type) {
        return null;
      }
      return (
        <Badge
          className={
            type.value === "income"
              ? "bg-emerald-900/50 text-emerald-300 hover:bg-emerald-800 border border-emerald-700 font-medium"
              : "bg-rose-900/50 text-rose-300 hover:bg-rose-800 border border-rose-700 font-medium"
          }
          variant="outline"
        >
          {type.value === "income" ? (
            <ArrowUpRight className="mr-1 h-3 w-3 inline" />
          ) : (
            <ArrowDownLeft className="mr-1 h-3 w-3 inline" />
          )}
          {type.label}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const type = row.getValue("type") as string;

      // Style based on income/expense
      return (
        <div
          className={`font-semibold flex items-center ${
            type === "income" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {" "}
          {type === "income" ? (
            <span className="inline-flex items-center">
              <span className="text-xs mr-1 bg-emerald-900/60 text-emerald-300 rounded-sm px-1 font-normal">
                +
              </span>
              {formatCurrency(amount)}
            </span>
          ) : (
            <span className="inline-flex items-center">
              <span className="text-xs mr-1 bg-rose-900/60 text-rose-300 rounded-sm px-1 font-normal">
                -
              </span>
              {formatCurrency(amount)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
