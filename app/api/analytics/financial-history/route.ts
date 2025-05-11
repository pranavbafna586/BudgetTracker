import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const period = searchParams.get("period") as "year" | "month";
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const yearInt = parseInt(year || new Date().getFullYear().toString());
    let startDate, endDate;
    let format: "month" | "day" = "month"; // Default for yearly view

    if (period === "year") {
      // Yearly data
      startDate = new Date(yearInt, 0, 1);
      endDate = new Date(yearInt, 11, 31, 23, 59, 59);
    } else {
      // Monthly data
      const monthInt = parseInt(month || new Date().getMonth().toString());
      startDate = new Date(yearInt, monthInt, 1);
      endDate = new Date(yearInt, monthInt + 1, 0, 23, 59, 59);
      format = "day";
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    let result: any[] = [];

    if (format === "month") {
      // Group by month for yearly view
      const monthlyData = Array.from({ length: 12 }, (_, i) => {
        const monthTransactions = transactions.filter(
          (t) => new Date(t.date).getMonth() === i
        );

        const income = monthTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = monthTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          label: new Date(yearInt, i, 1).toLocaleString("default", {
            month: "long",
          }),
          income,
          expense,
        };
      });

      result = monthlyData;
    } else {
      // Group by day for monthly view
      const daysInMonth = new Date(
        yearInt,
        parseInt(month || "0") + 1,
        0
      ).getDate();
      const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayTransactions = transactions.filter(
          (t) => new Date(t.date).getDate() === day
        );

        const income = dayTransactions
          .filter((t) => t.type === "income")
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = dayTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          label: `${day}`,
          income,
          expense,
        };
      });

      result = dailyData;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching financial history:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial history" },
      { status: 500 }
    );
  }
}
