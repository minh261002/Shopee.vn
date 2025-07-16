import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const now = new Date();

    const activeFlashSale = await prisma.flashSale.findFirst({
      where: {
        status: "ACTIVE",
        startTime: {
          lte: now,
        },
        endTime: {
          gte: now,
        },
      },
      include: {
        flashSaleItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                originalPrice: true,
                salePrice: true,
                stock: true,
                store: {
                  select: {
                    id: true,
                    name: true,
                    isVerified: true,
                    type: true,
                  },
                },
                images: {
                  where: { isMain: true },
                  take: 1,
                  select: {
                    url: true,
                    alt: true,
                  },
                },
              },
            },
          },
          orderBy: { priority: "desc" },
        },
      },
    });

    if (!activeFlashSale) {
      return NextResponse.json({ flashSale: null });
    }

    return NextResponse.json({ flashSale: activeFlashSale });
  } catch (error) {
    console.error("Error fetching active flash sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
