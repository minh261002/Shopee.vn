import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { ContentStatus } from "@prisma/client";
import { ContentType } from "@prisma/client";
import { ContentPosition } from "@prisma/client";

// GET - Lấy danh sách banner
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const position = searchParams.get("position");
    const campaignId = searchParams.get("campaignId");

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện tìm kiếm
    const where: {
      OR?: Array<
        { title: { contains: string } } | { description: { contains: string } }
      >;
      status?: ContentStatus;
      type?: ContentType;
      position?: ContentPosition;
      campaignId?: string;
    } = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) {
      where.status = status as ContentStatus;
    }

    if (type) {
      where.type = type as ContentType;
    }

    if (position) {
      where.position = position as ContentPosition;
    }

    if (campaignId && campaignId !== "none") {
      where.campaignId = campaignId;
    }

    // Lấy tổng số banner
    const total = await prisma.contentBlock.count({ where });

    // Lấy danh sách banner với phân trang
    const banners = await prisma.contentBlock.findMany({
      where,
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
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      banners,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tạo banner mới
export async function POST(request: NextRequest) {
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
      status = "DRAFT",
      position,
      priority = 0,
      startDate,
      endDate,
      isActive = true,
      targetAudience = "ALL_USERS",
      geographicTarget = "ALL_VIETNAM",
      targetLocations,
      targetDevices,
      targetCategories,
      targetUserGroups,
      backgroundColor,
      textColor,
      customCSS,
      showOnMobile = true,
      showOnTablet = true,
      showOnDesktop = true,
      clickTracking = true,
      impressionTracking = true,
      conversionTracking = true,
      isFlashSale = false,
      flashSaleEndTime,
      discountPercent,
      originalPrice,
      salePrice,
      campaignId,
      items = [],
    } = body;

    // Validation
    if (!title || !type || !position) {
      return NextResponse.json(
        { error: "Title, type, and position are required" },
        { status: 400 }
      );
    }

    // Kiểm tra campaignId nếu có
    if (campaignId && campaignId !== "none") {
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

    // Tạo banner
    const banner = await prisma.contentBlock.create({
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
        campaignId: campaignId === "none" ? null : campaignId,
        createdBy: session.user.id,
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

    // Tạo các items nếu có
    if (items.length > 0) {
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
                contentBlockId: banner.id,
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

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
