"use client";

import { useEffect, useState, useMemo } from "react";
import { DataTable } from "@/app/(dashboard)/transactions/components/data-table";
import { columns } from "./components/columns";
import { Transaction } from "./data/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, LineChart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoTransactions } from "./components/NoTransactions";
import Link from "next/link";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate summary stats for dashboard cards
  const stats = useMemo(() => {
    if (!transactions.length) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0,
      };
    }

    return transactions.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.amount);

        if (transaction.type === "income") {
          acc.totalIncome += amount;
        } else {
          acc.totalExpenses += amount;
        }

        acc.transactionCount++;
        acc.balance = acc.totalIncome - acc.totalExpenses;

        return acc;
      },
      {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0,
      }
    );
  }, [transactions]);

  useEffect(() => {
    // Fetch transactions from the database
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        console.log("Fetching transactions from API...");

        // Use a timestamp query parameter to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/transactions?_=${timestamp}`);

        if (!response.ok) {
          console.error("Error response:", await response.text());
          throw new Error(`Failed to fetch transactions: ${response.status}`);
        }

        const data = await response.json();
        console.log("Transactions fetched:", data.length);

        if (!data || !Array.isArray(data)) {
          console.error("Invalid data format received:", data);
          throw new Error("Invalid data format received");
        }

        // Ensure every transaction has a categoryIcon and valid date
        const sanitizedData = data.map((transaction: any) => {
          // Format date properly
          let formattedDate;
          try {
            formattedDate = new Date(transaction.date).toISOString();
          } catch (e) {
            formattedDate = new Date().toISOString();
          }

          return {
            ...transaction,
            categoryIcon: transaction.categoryIcon || "",
            date: formattedDate,
          };
        });

        setTransactions(sanitizedData);
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        // Only use mock data if we have an actual error
        if (process.env.NODE_ENV === "development") {
          console.warn("Falling back to mock data");
          const { mockTransactions } = await import(
            "@/app/(dashboard)/transactions/data/mock-data"
          );
          setTransactions(mockTransactions);
        } else {
          setTransactions([]); // Set empty array for production
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Transaction History
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage all your transactions in one place.
        </p>
      </div>

      {/* Financial summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(stats.totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(stats.totalExpenses)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <LineChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.balance >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {formatCurrency(stats.balance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">
              {stats.transactionCount > 99 ? "99+" : stats.transactionCount}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.transactionCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions table with tab filters */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-0">
          {" "}
          {loading ? (
            <Card className="bg-gray-950 border-gray-800">
              <CardContent className="flex justify-center items-center py-24">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  <p className="text-gray-400">Loading transactions...</p>
                </div>
              </CardContent>
            </Card>
          ) : transactions.length === 0 ? (
            <Card className="bg-gray-950 border-gray-800">
              <CardContent className="p-0">
                <NoTransactions onRefresh={() => window.location.reload()} />
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-950 border-gray-800">
              <CardContent className="p-0 sm:p-6">
                <DataTable columns={columns} data={transactions} />
              </CardContent>
            </Card>
          )}
        </TabsContent>{" "}
        <TabsContent value="income" className="mt-0">
          <Card className="bg-gray-950 border-gray-800">
            <CardContent className="p-0 sm:p-6">
              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">
                      Loading transactions...
                    </p>
                  </div>
                </div>
              ) : transactions.filter((t) => t.type === "income").length ===
                0 ? (
                <div className="flex justify-center items-center py-16 flex-col">
                  <div className="bg-gray-800 p-4 rounded-full mb-4">
                    <ArrowUpRight className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-white">
                    No income transactions
                  </h3>
                  <p className="text-gray-400 mb-4">
                    You haven't recorded any income yet.
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <Link href="/wizard">Add Income</Link>
                  </Button>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={transactions.filter((t) => t.type === "income")}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>{" "}
        <TabsContent value="expense" className="mt-0">
          <Card className="bg-gray-950 border-gray-800">
            <CardContent className="p-0 sm:p-6">
              {loading ? (
                <div className="flex justify-center items-center py-24">
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">
                      Loading transactions...
                    </p>
                  </div>
                </div>
              ) : transactions.filter((t) => t.type === "expense").length ===
                0 ? (
                <div className="flex justify-center items-center py-16 flex-col">
                  <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <ArrowDownLeft className="h-8 w-8 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No expense transactions
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't recorded any expenses yet.
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/wizard">Add Expense</Link>
                  </Button>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={transactions.filter((t) => t.type === "expense")}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
