"use client";

import * as React from "react";
import { Tooltip as RechartsTooltip, TooltipProps } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = {
  [key: string]: {
    label: string;
    color: string;
  };
};

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactNode;
}

export function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  return (
    <div
      className={cn("h-full w-full", className)}
      style={Object.fromEntries(
        Object.entries(config).map(([key, value]) => [
          `--color-${key}`,
          value.color,
        ])
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ChartTooltipProps extends Omit<TooltipProps<any, any>, "content"> {
  content?: React.ReactNode;
  indicator?: "line" | "dashed";
}

export function ChartTooltip({
  content,
  cursor = false,
  indicator,
  wrapperStyle = {},
  ...props
}: ChartTooltipProps) {
  return (
    <RechartsTooltip
      {...props}
      content={
        typeof content === "function"
          ? content
          : content
          ? () => content
          : undefined
      }
      wrapperStyle={{
        ...wrapperStyle,
        zIndex: 1000,
        visibility: "visible",
        pointerEvents: "none",
        fontSize: "14px", // Increased font size for tooltips
      }}
      cursor={
        indicator
          ? {
              stroke:
                "var(--tooltip-indicator-stroke, hsl(var(--muted-foreground)))",
              strokeWidth: 1,
              strokeDasharray: indicator === "dashed" ? "5 5" : undefined,
            }
          : cursor
      }
    />
  );
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: any;
    dataKey: string;
    payload: any;
  }>;
  label?: string;
  formatter?: (value: any, name: string, props: any) => [string, string];
  labelFormatter?: (label: string) => string;
  indicator?: "line" | "dashed";
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  indicator,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-md border bg-background px-3 py-2 shadow-md">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground font-medium">
          {labelFormatter ? labelFormatter(label as string) : label}
        </span>
        {payload.map((item) => {
          const formattedValue = formatter
            ? formatter(item.value, item.dataKey, item)
            : [item.value, item.dataKey];

          return (
            <div key={item.dataKey} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ background: `var(--color-${item.dataKey})` }}
              />
              <span className="text-base font-medium">{formattedValue[0]}</span>
              <span className="text-sm text-muted-foreground">
                {formattedValue[1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
