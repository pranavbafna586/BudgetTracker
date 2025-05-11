"use server";

import prisma from "@/lib/prisma";
import { CreateTransactionSchemaType } from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Get the category to retrieve its icon
  const category = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: form.category,
      type: form.type,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Create the transaction
  return await prisma.transaction.create({
    data: {
      userId: user.id,
      description: form.description || "",
      amount: form.amount,
      date: form.date,
      type: form.type,
      category: form.category,
      categoryIcon: category.icon,
    },
  });
}
