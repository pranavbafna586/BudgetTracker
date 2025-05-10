import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const { searchParams } = new URL(request.url);
  const paramType = searchParams.get("type");
  const validator = z.enum(["expense", "income"]);
  const querParams = validator.safeParse(paramType);
  if (!querParams.success) {
    return Response.json(querParams.error, {
      status: 400,
    });
  }
  const type = querParams.data;
  const categories = await prisma.category.findMany({
    where: {
      userId: user.id,
      ...(type && { type }),
    },
    orderBy: {
      name: "asc",
    },
  });
  return Response.json(categories);
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  try {
    const body = await request.json();
    console.log("Received category data:", body);

    const parsedBody = z
      .object({
        name: z.string().min(3).max(20),
        icon: z.string().max(20),
        type: z.enum(["income", "expense"]),
      })
      .safeParse(body);

    if (!parsedBody.success) {
      console.error("Validation error:", parsedBody.error);
      return Response.json(
        { error: "Invalid request data", details: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { name, icon, type } = parsedBody.data;

    // Check if category already exists for this user and type
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: user.id,
        name,
        type,
      },
    });

    if (existingCategory) {
      return Response.json(
        { error: "Category already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name,
        icon,
        type,
      },
    });

    return Response.json(category);
  } catch (error: any) {
    console.error("Failed to create category:", error);

    // Check for Prisma specific errors
    if (error.code === "P2002") {
      return Response.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    return Response.json(
      {
        error: "Failed to create category",
        details: error.message || "Unknown server error",
      },
      { status: 500 }
    );
  }
}
