"use client";

import { CategoryProvider } from "./components/CategoryProvider";
import { Separator } from "@/components/ui/separator";
import { FileBarChart, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TransactionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CategoryProvider>
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-4 lg:px-8 py-4 border-b">
          <div className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">
              Transactions
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/wizard">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Transaction
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-0">{children}</div>
      </div>
    </CategoryProvider>
  );
}
