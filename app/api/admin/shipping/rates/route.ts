import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET /api/admin/shipping/rates
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rates = await prisma.shippingRate.findMany({
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(rates);
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/shipping/rates
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      method,
      basePrice,
      perKgPrice,
      estimatedDays,
      isActive,
      providerId,
    } = body;

    // Validation
    if (!name || !method || !providerId) {
      return NextResponse.json(
        { error: "Name, method, and providerId are required" },
        { status: 400 }
      );
    }

    if (basePrice < 0 || perKgPrice < 0) {
      return NextResponse.json(
        { error: "Prices cannot be negative" },
        { status: 400 }
      );
    }

    if (estimatedDays < 1) {
      return NextResponse.json(
        { error: "Estimated days must be at least 1" },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = await prisma.shippingProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    const rate = await prisma.shippingRate.create({
      data: {
        name,
        method,
        basePrice,
        perKgPrice,
        estimatedDays,
        isActive: isActive ?? true,
        providerId,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    return NextResponse.json(rate, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping rate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
