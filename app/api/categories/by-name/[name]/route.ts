import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: { name: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fix: Access the name without destructuring to avoid the Next.js warning
    const categoryName = decodeURIComponent(context.params.name);
    const userId = req.nextUrl.searchParams.get("userId");

    if (!categoryName || !userId) {
      return NextResponse.json(
        { error: "Category name and userId are required" },
        { status: 400 }
      );
    }

    // Verify this is the correct user
    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`Deleting category: ${categoryName} for user: ${userId}`);

    // Delete the category directly
    const result = await prisma.category.deleteMany({
      where: {
        name: categoryName,
        userId: user.id,
      },
    });

    console.log(`Deleted ${result.count} categories`);

    if (result.count === 0) {
      return NextResponse.json(
        { error: "No categories found to delete" },
        { status: 404 }
      );
    }

    // Revalidate paths to ensure UI changes are reflected
    try {
      const revalidateResponse = await fetch(
        `${req.nextUrl.origin}/api/revalidate?path=/dashboard`,
        {
          method: "POST",
        }
      );
      console.log("Revalidation triggered:", revalidateResponse.ok);
    } catch (error) {
      console.error("Revalidation error:", error);
      // Don't fail the deletion if revalidation fails
    }

    return NextResponse.json({
      success: true,
      message: `Category '${categoryName}' deleted successfully`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category", details: String(error) },
      { status: 500 }
    );
  }
}
