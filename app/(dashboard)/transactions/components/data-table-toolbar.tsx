"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { transactionTypes } from "../data/data";
import { DataTableFacetedFilter } from "@/app/(dashboard)/transactions/components/data-table-faceted-filter";
import { DataTableViewOptions } from "@/app/(dashboard)/transactions/components/data-table-view-options";
import { useCategories } from "./CategoryProvider";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { categories, loading } = useCategories();
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between py-4">
      <div className="flex flex-wrap flex-1 items-center gap-2">
        <Input
          placeholder="Search transactions..."
          value={
            (table.getColumn("description")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="h-9 w-full sm:w-[250px] md:w-[300px]"
        />
        <div className="flex flex-wrap gap-2">
          {table.getColumn("category") && !loading && (
            <DataTableFacetedFilter
              column={table.getColumn("category")}
              title="Category"
              options={categories.length > 0 ? categories : []}
            />
          )}
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              column={table.getColumn("type")}
              title="Type"
              options={transactionTypes}
            />
          )}
          {isFiltered && (
            <Button
              variant="outline"
              onClick={() => table.resetColumnFilters()}
              className="h-9 px-2 lg:px-3 border-dashed"
            >
              Reset filters
              <X className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
