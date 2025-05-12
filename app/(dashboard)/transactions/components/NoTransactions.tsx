import { Button } from "@/components/ui/button";
import { FileBarChart, PlusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface NoTransactionsProps {
  onRefresh: () => void;
}

export function NoTransactions({ onRefresh }: NoTransactionsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
        <FileBarChart className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">No transactions found</h3>
      <p className="mb-8 text-center text-muted-foreground max-w-sm">
        You don&apos;t have any transactions yet. Start by adding your first
        income or expense.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button asChild>
          <Link href="/wizard">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Transaction
          </Link>
        </Button>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
