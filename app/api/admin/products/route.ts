import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Simple test - just get all products without complex relations
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        originalPrice: true,
        salePrice: true,
        stock: true,
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    // Add empty images array to match expected format
    const transformedProducts = products.map((product) => ({
      ...product,
      images: [],
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
