import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CreateTransactionSchema } from "@/schema/transaction";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      redirect("/sign-in");
    }

    const { searchParams } = new URL(request.url);
    const paramType = searchParams.get("type");

    // Only validate if type parameter exists
    let type = undefined;
    if (paramType) {
      if (paramType === "expense" || paramType === "income") {
        type = paramType;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        ...(type && { type }),
      },
      orderBy: {
        date: "desc",
      },
    });

    return Response.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return Response.json(
      { error: "Error fetching transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const body = await request.json();
    const parsedBody = CreateTransactionSchema.safeParse(body);

    if (!parsedBody.success) {
      return Response.json(
        { error: "Invalid request data", details: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { description, amount, date, type, category } = parsedBody.data;

    // Get the category to retrieve its icon
    const categoryData = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name: category,
        type: type,
      },
    });

    if (!categoryData) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        description: description || "",
        amount: amount,
        date: date,
        type: type,
        category: category,
        categoryIcon: categoryData.icon,
      },
    });

    // Revalidate the dashboard that displays transactions
    revalidatePath("/");

    return Response.json(transaction);
  } catch (error: any) {
    console.error("Failed to create transaction:", error);

    return Response.json(
      {
        error: "Failed to create transaction",
        details: error.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
}
