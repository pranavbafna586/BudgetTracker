import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Get the current month's data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const incomeTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "income",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Group by category
    const categoryGroups = incomeTransactions.reduce(
      (groups: Record<string, any>, transaction) => {
        const { category, categoryIcon, amount } = transaction;

        if (!groups[category]) {
          groups[category] = {
            category,
            icon: categoryIcon,
            amount: 0,
            color: getCategoryColor(category), // Helper function to assign colors
          };
        }

        groups[category].amount += amount;
        return groups;
      },
      {}
    );

    // Convert to array and sort by amount descending
    const result = Object.values(categoryGroups).sort(
      (a: any, b: any) => b.amount - a.amount
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching income categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch income categories" },
      { status: 500 }
    );
  }
}

// Helper function to assign colors to categories
function getCategoryColor(category: string): string {
  // Generate consistent colors based on category name
  const colors = [
    "hsl(142, 76%, 36%)", // emerald-600
    "hsl(142, 71%, 45%)", // emerald-500
    "hsl(142, 69%, 58%)", // emerald-400
    "hsl(142, 77%, 73%)", // emerald-300
    "hsl(142, 72%, 82%)", // emerald-200
  ];

  // Simple hash function to pick a color
  const hash = category
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
