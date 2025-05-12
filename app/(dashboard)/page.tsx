import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import CreateTransactionDialog from "./_components/CreateTransactionDialog";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  WalletIcon,
  PieChartIcon,
  TrendingUpIcon,
  HistoryIcon,
} from "lucide-react";
import { IncomeByCategory } from "./_components/IncomeByCategory";
import { ExpenseByCategory } from "./_components/ExpenseByCategory";
import { FinancialHistory } from "./_components/FinancialHistory";

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });
  if (!userSettings) {
    redirect("/wizard");
  }

  // Fetch summary data
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(currentYear, currentMonth - 1, 1),
        lt: new Date(currentYear, currentMonth, 1),
      },
    },
  });

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expense;
  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card shadow-sm">
        {" "}
        <div className="container flex flex-wrap items-center justify-between gap-4 py-6 px-4 md:px-6">
          <p className="text-3xl font-bold tracking-tight">
        Hello, {user.firstName}! 👋🏻
          </p>
          <div className="flex items-center gap-3">
        <CreateTransactionDialog
          trigger={
            <Button
          variant={"outline"}
          className="!border-emerald-500 !bg-emerald-950 !text-white hover:!bg-emerald-700 hover:!text-white text-base font-medium px-5 py-5"
            >
          New Income 🤑
            </Button>
          }
          type="income"
        />
        <CreateTransactionDialog
          trigger={
            <Button
          variant={"outline"}
          className="!border-rose-500 !bg-rose-950 !text-white hover:!bg-rose-700 hover:!text-white text-base font-medium px-5 py-5"
            >
          New Expense 😤
            </Button>
          }
          type="expense"
        />
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6 px-4 md:px-6">
        {" "}
        {/* Overview Header with Date Range */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
            <p className="text-base text-muted-foreground">
              View your financial analytics
            </p>
          </div>
          <DatePickerWithRange className="w-full md:w-auto text-base" />
        </div>{" "}
        {/* Financial Summary Cards */}{" "}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {" "}
          <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full">
              <CardContent className="py-4 px-4 flex-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpIcon className="h-6 w-6 text-emerald-500" />
                  <CardTitle className="text-2xl font-medium">
                    Total Income
                  </CardTitle>
                </div>
                <div className="text-2xl font-bold text-emerald-500">
                  {formatCurrency(income, "INR")}
                </div>
              </CardContent>
            </div>
          </Card>{" "}
          <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full">
              <CardContent className="py-4 px-4 flex-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownIcon className="h-6 w-6 text-rose-500" />
                  <CardTitle className="text-2xl font-medium">
                    Total Expenses
                  </CardTitle>
                </div>
                <div className="text-2xl font-bold text-rose-500">
                  {formatCurrency(expense, "INR")}
                </div>
              </CardContent>
            </div>
          </Card>{" "}
          <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col h-full">
              <CardContent className="py-4 px-4 flex-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WalletIcon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl font-medium">
                    Net Balance
                  </CardTitle>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    balance >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {formatCurrency(balance, "INR")}
                </div>
              </CardContent>
            </div>
          </Card>
        </div>{" "}
        {/* Category Analysis Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">
                  Income by Category
                </CardTitle>
                <PieChartIcon className="h-5 w-5 text-emerald-500" />
              </div>
              <CardDescription className="text-sm mt-1">
                Breakdown of your income sources
              </CardDescription>
            </CardHeader>
            <IncomeByCategory userId={user.id} currency="INR" />
          </Card>

          <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">
                  Expense by Category
                </CardTitle>
                <PieChartIcon className="h-5 w-5 text-rose-500" />
              </div>
              <CardDescription className="text-sm mt-1">
                Where your money is going
              </CardDescription>
            </CardHeader>
            <ExpenseByCategory userId={user.id} currency="INR" />
          </Card>
        </div>{" "}
        {/* Financial History Chart */}{" "}
        {/* Financial History and Recent Transactions Row */}
        <div className="grid grid-cols-1 gap-4">
          <Card className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Financial History
                </CardTitle>
                <HistoryIcon className="h-5 w-5 text-primary" />
              </div>
              <CardDescription className="text-sm mt-1">
                Track your financial trends over time
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <FinancialHistory userId={user.id} currency="INR" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default page;
