import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

// GET - Lấy thông tin banner theo ID
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

    const banner = await prisma.contentBlock.findUnique({
      where: { id: params.id },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật banner
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

    const body = await request.json();
    const {
      title,
      description,
      type,
      status,
      position,
      priority,
      startDate,
      endDate,
      isActive,
      targetAudience,
      geographicTarget,
      targetLocations,
      targetDevices,
      targetCategories,
      targetUserGroups,
      backgroundColor,
      textColor,
      customCSS,
      showOnMobile,
      showOnTablet,
      showOnDesktop,
      clickTracking,
      impressionTracking,
      conversionTracking,
      isFlashSale,
      flashSaleEndTime,
      discountPercent,
      originalPrice,
      salePrice,
      campaignId,
      items = [],
    } = body;

    // Kiểm tra banner tồn tại
    const existingBanner = await prisma.contentBlock.findUnique({
      where: { id: params.id },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Kiểm tra campaignId nếu có
    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 400 }
        );
      }
    }

    // Cập nhật banner
    const updatedBanner = await prisma.contentBlock.update({
      where: { id: params.id },
      data: {
        title,
        description,
        type,
        status,
        position,
        priority,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive,
        targetAudience,
        geographicTarget,
        targetLocations,
        targetDevices,
        targetCategories,
        targetUserGroups,
        backgroundColor,
        textColor,
        customCSS,
        showOnMobile,
        showOnTablet,
        showOnDesktop,
        clickTracking,
        impressionTracking,
        conversionTracking,
        isFlashSale,
        flashSaleEndTime: flashSaleEndTime ? new Date(flashSaleEndTime) : null,
        discountPercent,
        originalPrice,
        salePrice,
        campaignId,
        updatedBy: session.user.id,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
    });

    // Cập nhật items nếu có
    if (items.length > 0) {
      // Xóa items cũ
      await prisma.contentItem.deleteMany({
        where: { contentBlockId: params.id },
      });

      // Tạo items mới
      await Promise.all(
        items.map(
          (
            item: {
              title?: string;
              subtitle?: string;
              description?: string;
              image: string;
              imageAlt?: string;
              linkUrl?: string;
              linkText?: string;
              openInNewTab?: boolean;
              productId?: string;
              categoryId?: string;
              brandId?: string;
              order?: number;
              metadata?: string;
            },
            index: number
          ) =>
            prisma.contentItem.create({
              data: {
                contentBlockId: params.id,
                title: item.title,
                subtitle: item.subtitle,
                description: item.description,
                image: item.image,
                imageAlt: item.imageAlt,
                linkUrl: item.linkUrl,
                linkText: item.linkText,
                openInNewTab: item.openInNewTab || false,
                productId: item.productId,
                categoryId: item.categoryId,
                brandId: item.brandId,
                order: item.order || index,
                metadata: item.metadata,
              },
            })
        )
      );
    }

    return NextResponse.json(updatedBanner);
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa banner
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

    // Kiểm tra banner tồn tại
    const existingBanner = await prisma.contentBlock.findUnique({
      where: { id: params.id },
    });

    if (!existingBanner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    // Xóa banner (items sẽ tự động xóa do cascade)
    await prisma.contentBlock.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
