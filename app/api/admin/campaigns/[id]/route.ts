import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { campaignUpdateSchema } from "@/validations/campaign";
import { ZodError } from "zod/v3";
import { ContentStatus, TargetAudience } from "@prisma/client";
import { GeographicTarget } from "@prisma/client";
import { CampaignType } from "@prisma/client";

// GET - Lấy thông tin chiến dịch theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        contentBlocks: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            status: true,
            position: true,
            priority: true,
            startDate: true,
            endDate: true,
            isActive: true,
            targetAudience: true,
            geographicTarget: true,
            isFlashSale: true,
            flashSaleEndTime: true,
            discountPercent: true,
            originalPrice: true,
            salePrice: true,
            createdAt: true,
            updatedAt: true,
            items: {
              select: {
                id: true,
                title: true,
                subtitle: true,
                description: true,
                image: true,
                imageAlt: true,
                linkUrl: true,
                linkText: true,
                openInNewTab: true,
                productId: true,
                categoryId: true,
                brandId: true,
                order: true,
                metadata: true,
                createdAt: true,
                updatedAt: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { priority: "asc" },
        },
        _count: {
          select: {
            contentBlocks: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Không tìm thấy chiến dịch" },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy thông tin chiến dịch" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật chiến dịch
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Validate input
    const validatedData = campaignUpdateSchema.parse(body);

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Không tìm thấy chiến dịch" },
        { status: 404 }
      );
    }

    // Convert string dates to Date objects
    const updateData: {
      name?: string;
      description?: string;
      status?: ContentStatus;
      startDate?: Date | null;
      endDate?: Date | null;
      budget?: number;
      targetImpressions?: number;
      targetClicks?: number;
      targetConversions?: number;
      targetRevenue?: number;
      targetAudience?: TargetAudience;
      geographicTarget?: GeographicTarget;
      targetLocations?: string;
      targetDevices?: string;
      targetCategories?: string;
      conditions?: string;
      campaignType?: CampaignType;
      isFeatured?: boolean;
    } = {};

    // Copy non-date fields
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;
    if (validatedData.targetAudience !== undefined)
      updateData.targetAudience = validatedData.targetAudience;
    if (validatedData.geographicTarget !== undefined)
      updateData.geographicTarget = validatedData.geographicTarget;
    if (validatedData.targetLocations !== undefined)
      updateData.targetLocations = validatedData.targetLocations;
    if (validatedData.targetDevices !== undefined)
      updateData.targetDevices = validatedData.targetDevices;
    if (validatedData.targetCategories !== undefined)
      updateData.targetCategories = validatedData.targetCategories;
    if (validatedData.conditions !== undefined)
      updateData.conditions = validatedData.conditions;
    if (validatedData.campaignType !== undefined)
      updateData.campaignType = validatedData.campaignType;
    if (validatedData.isFeatured !== undefined)
      updateData.isFeatured = validatedData.isFeatured;

    // Handle date fields with conversion
    if (validatedData.startDate !== undefined) {
      updateData.startDate = validatedData.startDate
        ? new Date(validatedData.startDate)
        : null;
    }
    if (validatedData.endDate !== undefined) {
      updateData.endDate = validatedData.endDate
        ? new Date(validatedData.endDate)
        : null;
    }
    if (validatedData.budget !== undefined) {
      updateData.budget = Number(validatedData.budget);
    }
    if (validatedData.targetImpressions !== undefined) {
      updateData.targetImpressions = Number(validatedData.targetImpressions);
    }
    if (validatedData.targetClicks !== undefined) {
      updateData.targetClicks = Number(validatedData.targetClicks);
    }
    if (validatedData.targetConversions !== undefined) {
      updateData.targetConversions = Number(validatedData.targetConversions);
    }
    if (validatedData.targetRevenue !== undefined) {
      updateData.targetRevenue = Number(validatedData.targetRevenue);
    }

    // Update campaign
    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        contentBlocks: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            status: true,
          },
        },
        _count: {
          select: {
            contentBlocks: true,
          },
        },
      },
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Dữ liệu không hợp lệ",
          details: (error as ZodError).errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Lỗi khi cập nhật chiến dịch" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa chiến dịch
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if campaign exists
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Không tìm thấy chiến dịch" },
        { status: 404 }
      );
    }

    // Delete campaign (this will also delete related content blocks due to cascade)
    await prisma.campaign.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Xóa chiến dịch thành công" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Lỗi khi xóa chiến dịch" },
      { status: 500 }
    );
  }
}
