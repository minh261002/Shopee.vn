import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { headers } from "next/headers";

const updateFlashSaleSchema = z.object({
  name: z.string().min(1, "Tên flash sale là bắt buộc").optional(),
  description: z.string().optional(),
  bannerImage: z.string().optional(),
  startTime: z.string().min(1, "Thời gian bắt đầu là bắt buộc").optional(),
  endTime: z.string().min(1, "Thời gian kết thúc là bắt buộc").optional(),
  maxQuantityPerUser: z.number().min(1).optional(),
  minOrderAmount: z.number().min(0).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const flashSale = await prisma.flashSale.findUnique({
      where: { id },
      include: {
        flashSaleItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                originalPrice: true,
                salePrice: true,
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
          },
          orderBy: { priority: "desc" },
        },
      },
    });

    if (!flashSale) {
      return NextResponse.json(
        { error: "Flash sale not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(flashSale);
  } catch (error) {
    console.error("Error fetching flash sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateFlashSaleSchema.parse(body);

    // Check if flash sale exists
    const existingFlashSale = await prisma.flashSale.findUnique({
      where: { id },
    });

    if (!existingFlashSale) {
      return NextResponse.json(
        { error: "Flash sale not found" },
        { status: 404 }
      );
    }

    // Validate dates if provided
    if (validatedData.startTime && validatedData.endTime) {
      const startTime = new Date(validatedData.startTime);
      const endTime = new Date(validatedData.endTime);

      if (startTime >= endTime) {
        return NextResponse.json(
          { error: "Thời gian kết thúc phải sau thời gian bắt đầu" },
          { status: 400 }
        );
      }
    }

    // Determine status based on dates
    let status = existingFlashSale.status;
    if (validatedData.startTime || validatedData.endTime) {
      const startTime = validatedData.startTime
        ? new Date(validatedData.startTime)
        : existingFlashSale.startTime;
      const endTime = validatedData.endTime
        ? new Date(validatedData.endTime)
        : existingFlashSale.endTime;

      const now = new Date();
      if (now >= startTime && now <= endTime) {
        status = "ACTIVE";
      } else if (now > endTime) {
        status = "ENDED";
      } else {
        status = "UPCOMING";
      }
    }

    const updatedFlashSale = await prisma.flashSale.update({
      where: { id },
      data: {
        ...validatedData,
        ...(validatedData.startTime && {
          startTime: new Date(validatedData.startTime),
        }),
        ...(validatedData.endTime && {
          endTime: new Date(validatedData.endTime),
        }),
        status,
      },
    });

    return NextResponse.json(updatedFlashSale);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating flash sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if flash sale exists
    const existingFlashSale = await prisma.flashSale.findUnique({
      where: { id },
    });

    if (!existingFlashSale) {
      return NextResponse.json(
        { error: "Flash sale not found" },
        { status: 404 }
      );
    }

    // Delete flash sale (cascade will delete flash sale items)
    await prisma.flashSale.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Flash sale deleted successfully" });
  } catch (error) {
    console.error("Error deleting flash sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
