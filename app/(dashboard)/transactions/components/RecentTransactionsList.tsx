"use client";

import { Transaction } from "../data/schema";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ShoppingCart,
  Utensils,
  Home,
  Car,
  HeartPulse,
  Landmark,
  GraduationCap,
  Plane,
  ShoppingBag,
  Briefcase,
  Gift,
  Wallet,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecentTransactionsListProps {
  transactions: Transaction[];
  limit?: number;
  showViewAll?: boolean;
}

export function RecentTransactionsList({
  transactions,
  limit = 5,
  showViewAll = true,
}: RecentTransactionsListProps) {
  const displayTransactions = transactions.slice(0, limit);

  // Icon mapping for category icons
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your {limit} most recent financial transactions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {displayTransactions.map((transaction) => {
            const IconComponent = transaction.categoryIcon
              ? iconMap[transaction.categoryIcon]
              : ShoppingCart;

            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-4 px-6"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      transaction.type === "income"
                        ? "bg-emerald-100"
                        : "bg-rose-100"
                    }`}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={`h-5 w-5 ${
                          transaction.type === "income"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.description.length > 30
                        ? `${transaction.description.substring(0, 30)}...`
                        : transaction.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className={`font-semibold ${
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(transaction.date)}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}

          {displayTransactions.length === 0 && (
            <div className="py-6 text-center text-muted-foreground">
              No recent transactions found
            </div>
          )}
        </div>
      </CardContent>
      {showViewAll && (
        <CardFooter className="flex justify-center border-t px-6 py-4">
          <Button variant="outline" asChild>
            <Link href="/transactions">View All Transactions</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
