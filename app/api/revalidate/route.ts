import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Path parameter is required" },
        { status: 400 }
      );
    }

    // Revalidate the specific path
    revalidatePath(path);
    console.log(`Revalidated path: ${path}`);

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      path,
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      {
        revalidated: false,
        now: Date.now(),
        error: "Failed to revalidate",
      },
      { status: 500 }
    );
  }
}
