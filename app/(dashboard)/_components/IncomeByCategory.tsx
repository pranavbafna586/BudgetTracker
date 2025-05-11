"use client";

import * as React from "react";
import {
  Label,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CardContent, CardDescription } from "@/components/ui/card";
import {
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type IncomeCategoryData = {
  category: string;
  amount: number;
  icon: string;
  color: string;
};

export function IncomeByCategory({
  userId,
  currency,
}: {
  userId: string;
  currency: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["income-categories", userId],
    queryFn: async () => {
      try {
        const res = await fetch(
          `/api/analytics/income-by-category?userId=${userId}`
        );

        if (!res.ok) {
          console.error("Income category error:", {
            status: res.status,
            statusText: res.statusText,
          });
          throw new Error(`Failed to fetch income categories: ${res.status}`);
        }

        return res.json() as Promise<IncomeCategoryData[]>;
      } catch (error) {
        console.error("Income category fetch error:", error);
        throw error;
      }
    },
  });

  // Calculate total income
  const totalIncome = React.useMemo(() => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, item) => sum + item.amount, 0);
  }, [data]);

  // Generate distinct colors for categories if not provided
  const categoryColors = React.useMemo(() => {
    if (!data) return {};

    // Predefined vibrant colors specifically for income categories
    const incomeColors = [
      "hsl(142, 76%, 36%)", // emerald-600
      "hsl(160, 84%, 39%)", // green-500
      "hsl(168, 80%, 23%)", // teal-700
      "hsl(158, 64%, 52%)", // emerald-400
      "hsl(151, 55%, 41%)", // green-600
      "hsl(142, 69%, 58%)", // emerald-300
      "hsl(120, 100%, 25%)", // green-800
      "hsl(186, 98%, 29%)", // cyan-700
      "hsl(168, 66%, 43%)", // teal-500
      "hsl(142, 71%, 45%)", // emerald-500
    ];

    // Create a map of category to color
    const colorMap: Record<string, string> = {};
    data.forEach((item, index) => {
      colorMap[item.category] =
        item.color || incomeColors[index % incomeColors.length];
    });

    return colorMap;
  }, [data]);

  // Format chart data with enhanced colors
  const chartData = React.useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      category: item.category,
      amount: item.amount,
      fill: categoryColors[item.category] || item.color,
      icon: item.icon,
    }));
  }, [data, categoryColors]);

  // Generate chart config
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: "Amount",
        color: "hsl(var(--emerald-500))",
      },
    };

    if (data) {
      data.forEach((item) => {
        config[item.category] = {
          label: item.category,
          color: item.color,
        };
      });
    }

    return config;
  }, [data]);
  if (isLoading || error || !data || data.length === 0) {
    return (
      <CardContent className="h-[230px] flex items-center justify-center">
        {isLoading ? (
          <Skeleton className="h-[230px] w-full rounded-full mx-auto" />
        ) : error ? (
          <Alert
            variant="destructive"
            className="flex items-center justify-center"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-base">Error</AlertTitle>
            <AlertDescription className="text-sm">
              Failed to load income categories.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center justify-center text-muted-foreground text-base">
            No income data available
          </div>
        )}
      </CardContent>
    );
  }

  const monthName = new Date().toLocaleString("default", { month: "long" });
  const year = new Date().getFullYear();
  return (
    <div className="w-full flex flex-col h-full">
      <CardDescription className="text-center text-base mb-2">
        {monthName} {year}
      </CardDescription>
      <CardContent className="pt-0 pb-3 flex-1">
        <div className="aspect-square max-h-[200px] mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Tooltip
                wrapperStyle={{
                  zIndex: 1000,
                  pointerEvents: "auto",
                  visibility: "visible",
                  background: "var(--background)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  border: "1px solid var(--border)",
                }}
                content={(props) => {
                  const { active, payload } = props;
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card p-4 border rounded-lg shadow-md">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: data.fill }}
                          />
                          <p className="font-medium flex items-center gap-2 text-base">
                            <span className="text-xl">{data.icon}</span>
                            <span>{data.category}</span>
                          </p>
                        </div>
                        <p className="text-emerald-500 font-bold text-xl mt-2">
                          {formatCurrency(data.amount, currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {((data.amount / totalIncome) * 100).toFixed(1)}% of
                          total
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
                isAnimationActive={true}
              />{" "}
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="category"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={5}
                strokeWidth={2}
                stroke="#ffffff"
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-lg font-bold"
                          >
                            {formatCurrency(totalIncome, currency)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 18}
                            className="fill-muted-foreground text-sm"
                          >
                            Total Income
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>{" "}
      <div className="text-center px-2 pb-2 flex flex-col items-center gap-2">
        <div className="font-medium leading-none text-emerald-500 text-sm">
          {chartData.length} income{" "}
          {chartData.length === 1 ? "category" : "categories"}
        </div>
        <div className="leading-none text-muted-foreground text-sm">
          Main source: {chartData[0]?.category || "None"}
        </div>
      </div>
    </div>
  );
}
