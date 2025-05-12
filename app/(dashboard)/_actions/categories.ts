"use server";

import prisma from "@/lib/prisma";
import {
  CreateCategorySchema,
  CreateCategorySchemaType,
} from "@/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function CreateCategory(form: CreateCategorySchemaType) {
  const parsedBody = CreateCategorySchema.safeParse(form);
  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { name, icon, type } = parsedBody.data;
  return await prisma.category.create({
    data: {
      userId: user.id,
      name,
      icon,
      type,
    },
  });
}

export async function DeleteCategory(name: string, type: string) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  try {
    const deletedCategory = await prisma.category.delete({
      where: {
        name_userId_type: {
          name,
          userId: user.id,
          type,
        },
      },
    });
    return { success: true, category: deletedCategory };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
