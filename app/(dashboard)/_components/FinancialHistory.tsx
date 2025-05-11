"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  CalendarIcon,
  FilterIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

type FinancialData = {
  label: string;
  income: number;
  expense: number;
};

export function FinancialHistory({
  userId,
  currency,
}: {
  userId: string;
  currency: string;
}) {
  // Period and data selection state
  const [period, setPeriod] = useState<"year" | "month">("month");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>(new Date().getMonth().toString());
  const [showType, setShowType] = useState<"both" | "income" | "expense">(
    "both"
  );
  const [activeBar, setActiveBar] = useState<string | null>(null);

  // Define chart colors
  const INCOME_COLOR = "hsl(142, 76%, 36%)"; // emerald-600
  const INCOME_COLOR_HOVER = "hsl(142, 71%, 45%)"; // emerald-500
  const EXPENSE_COLOR = "hsl(346, 84%, 61%)"; // rose-500
  const EXPENSE_COLOR_HOVER = "hsl(346, 77%, 49%)"; // rose-600

  // Years and months for selectors
  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  // Format number to display currency in compact form
  const formatYAxis = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  // Format X axis labels based on period
  const formatXAxis = (value: string) => {
    if (period === "month") {
      return value;
    } else {
      return value.substring(0, 3);
    }
  };

  // Fetch financial history data
  const { data, isLoading, error } = useQuery({
    queryKey: ["financial-history", userId, period, year, month],
    queryFn: async () => {
      try {
        const res = await fetch(
          `/api/analytics/financial-history?userId=${userId}&period=${period}&year=${year}${
            period === "month" ? `&month=${month}` : ""
          }`
        );

        if (!res.ok) {
          console.error("Financial history error:", {
            status: res.status,
            statusText: res.statusText,
          });
          throw new Error(`Failed to fetch financial history: ${res.status}`);
        }

        return res.json() as Promise<FinancialData[]>;
      } catch (error) {
        console.error("Financial history fetch error:", error);
        throw error;
      }
    },
  });

  // Calculate trend percentage
  const getTrend = () => {
    if (!data || data.length < 2) return { percentage: 0, trending: "neutral" };

    const lastIndex = data.length - 1;
    const currentTotal = data[lastIndex].income - data[lastIndex].expense;
    const previousTotal =
      data[lastIndex - 1].income - data[lastIndex - 1].expense;

    if (previousTotal === 0)
      return { percentage: 100, trending: currentTotal > 0 ? "up" : "down" };

    const change =
      ((currentTotal - previousTotal) / Math.abs(previousTotal)) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      trending: change >= 0 ? "up" : "down",
    };
  };

  const trend = getTrend();
  const periodText = period === "month" ? "this month" : "this year";
  const periodDisplay =
    period === "month"
      ? `${months.find((m) => m.value === month)?.label || "Month"} ${year}`
      : `Year ${year}`;

  // Loading, error and empty state handling
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[250px] w-full rounded-lg" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-rose-500 gap-3 border rounded-lg p-5 bg-rose-50 dark:bg-rose-950/20">
        <AlertCircle className="h-10 w-10" />
        <p className="font-medium text-lg">Failed to load financial history</p>
        <p className="text-base text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground gap-3 border rounded-lg p-5 bg-muted/30">
        <CalendarIcon className="h-10 w-10 text-muted-foreground/70" />
        <p className="font-medium text-lg">No financial data available</p>
        <p className="text-base">Try selecting a different time period</p>
      </div>
    );
  }
  // Custom tooltip content renderer
  const renderTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-md border bg-card p-4 shadow-lg">
          <p className="text-base font-medium mb-2">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 mb-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background:
                    entry.name === "Income" ? INCOME_COLOR : EXPENSE_COLOR,
                }}
              />{" "}
              <span className="text-sm text-muted-foreground">
                {entry.name}:
              </span>
              <span
                className={`font-medium text-base ${
                  entry.name === "Income" ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {formatCurrency(entry.value, currency)}
              </span>
            </div>
          ))}
          {payload.length === 2 && (
            <div className="mt-2 pt-2 border-t text-base">
              <span className="text-muted-foreground text-sm">Balance: </span>
              <span
                className={`font-medium ${
                  calculateBalance(payload) >= 0
                    ? "text-emerald-500"
                    : "text-rose-500"
                }`}
              >
                {formatCurrency(calculateBalance(payload), currency)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Helper function to calculate balance from tooltip payload
  const calculateBalance = (payload: any[]) => {
    const incomeEntry = payload.find((entry) => entry.name === "Income");
    const expenseEntry = payload.find((entry) => entry.name === "Expense");

    const income = incomeEntry ? incomeEntry.value : 0;
    const expense = expenseEntry ? expenseEntry.value : 0;

    return income - expense;
  };
  return (
    <div className="space-y-6">
      {/* Controls and filters section */}
      <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-end">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-base font-medium">{periodDisplay}</span>
            {trend.trending === "up" ? (
              <span className="text-sm text-emerald-500 flex items-center bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full">
                +{trend.percentage}%
                <TrendingUp className="h-4 w-4 ml-1" />
              </span>
            ) : (
              <span className="text-sm text-rose-500 flex items-center bg-rose-50 dark:bg-rose-950/30 px-3 py-1 rounded-full">
                -{trend.percentage}%
                <TrendingDown className="h-4 w-4 ml-1" />
              </span>
            )}
          </div>
        </div>{" "}
        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center gap-4">
          <div className="flex gap-3 items-center">
            <Tabs
              value={period}
              onValueChange={(v) => setPeriod(v as "year" | "month")}
              className="w-auto"
            >
              <TabsList className="h-9">
                <TabsTrigger value="month" className="text-sm px-4">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="year" className="text-sm px-4">
                  Yearly
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {period === "year" ? (
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[100px] h-9 text-sm">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y} className="text-sm">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger className="w-[110px] h-9 text-sm">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem
                        key={m.value}
                        value={m.value}
                        className="text-sm"
                      >
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="w-[80px] h-9 text-sm">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y} className="text-sm">
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>{" "}
          <div className="flex items-center gap-3">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <ToggleGroup
              type="single"
              value={showType}
              onValueChange={(value) =>
                value && setShowType(value as "both" | "income" | "expense")
              }
              className="h-9 bg-muted/50 rounded-md p-0.5"
            >
              <ToggleGroupItem
                value="both"
                className="px-4 text-sm rounded data-[state=on]:bg-background data-[state=on]:shadow-sm"
              >
                All
              </ToggleGroupItem>
              <ToggleGroupItem
                value="income"
                className="px-4 text-sm rounded data-[state=on]:bg-emerald-50 data-[state=on]:text-emerald-600 dark:data-[state=on]:bg-emerald-950/50 data-[state=on]:shadow-sm"
              >
                Income
              </ToggleGroupItem>
              <ToggleGroupItem
                value="expense"
                className="px-4 text-sm rounded data-[state=on]:bg-rose-50 data-[state=on]:text-rose-600 dark:data-[state=on]:bg-rose-950/50 data-[state=on]:shadow-sm"
              >
                Expense
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>{" "}
      {/* Chart section */}
      <div className="rounded-lg border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 15, right: 15, bottom: 25, left: 15 }}
              onMouseMove={(state) => {
                if (state?.activeTooltipIndex !== undefined) {
                  setActiveBar(
                    `${state.activeTooltipIndex}-${state.activeLabel}`
                  );
                }
              }}
              onMouseLeave={() => setActiveBar(null)}
            >
              {" "}
              <CartesianGrid vertical={false} strokeOpacity={0.2} />
              <XAxis
                dataKey="label"
                tickLine={false}
                tickMargin={10}
                axisLine={true}
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
                height={35}
              />
              <YAxis
                tickFormatter={formatYAxis}
                axisLine={true}
                tickLine={true}
                tick={{ fontSize: 12 }}
                width={50}
              />
              <Legend
                verticalAlign="top"
                height={35}
                formatter={(value) => (
                  <span className="text-sm font-medium">
                    {value === "income" ? "Income" : "Expense"}
                  </span>
                )}
                iconSize={10}
                iconType="circle"
                wrapperStyle={{ paddingTop: 4 }}
              />{" "}
              <RechartsTooltip
                cursor={{ fill: "rgba(240, 240, 250, 0.15)" }}
                content={renderTooltipContent}
              />
              {(showType === "both" || showType === "income") && (
                <Bar
                  dataKey="income"
                  name="Income"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                  animationDuration={800}
                  fill={INCOME_COLOR}
                  activeBar={{ fill: INCOME_COLOR_HOVER }}
                />
              )}
              {(showType === "both" || showType === "expense") && (
                <Bar
                  dataKey="expense"
                  name="Expense"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                  animationDuration={800}
                  fill={EXPENSE_COLOR}
                  activeBar={{ fill: EXPENSE_COLOR_HOVER }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
