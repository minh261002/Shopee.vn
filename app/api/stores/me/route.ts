import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Get session
    const sessionResponse = await fetch(
      `${req.nextUrl.origin}/api/auth/session`,
      {
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      }
    );

    if (!sessionResponse.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await sessionResponse.json();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get store
    const store = await prisma.store.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("Get store error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
