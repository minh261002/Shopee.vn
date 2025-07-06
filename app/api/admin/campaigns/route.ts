import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

import { campaignSchema } from "@/validations/campaign";
import type {
  CampaignsResponse,
  CampaignFilters,
  Campaign,
} from "@/types/campaign";
import { ZodError } from "zod/v3";

// GET - Lấy danh sách chiến dịch
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

    // Filters
    const status = searchParams.get("status") as CampaignFilters["status"];
    const campaignType = searchParams.get(
      "campaignType"
    ) as CampaignFilters["campaignType"];
    const targetAudience = searchParams.get(
      "targetAudience"
    ) as CampaignFilters["targetAudience"];
    const geographicTarget = searchParams.get(
      "geographicTarget"
    ) as CampaignFilters["geographicTarget"];
    const isFeatured =
      searchParams.get("isFeatured") === "true"
        ? true
        : searchParams.get("isFeatured") === "false"
          ? false
          : undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: {
      OR?: Array<{
        name?: { contains: string };
        description?: { contains: string };
      }>;
      status?: CampaignFilters["status"];
      campaignType?: CampaignFilters["campaignType"];
      targetAudience?: CampaignFilters["targetAudience"];
      geographicTarget?: CampaignFilters["geographicTarget"];
      isFeatured?: boolean;
      AND?: Array<{ startDate?: { gte: Date }; endDate?: { lte: Date } }>;
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status) where.status = status;
    if (campaignType) where.campaignType = campaignType;
    if (targetAudience) where.targetAudience = targetAudience;
    if (geographicTarget) where.geographicTarget = geographicTarget;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;

    if (startDate || endDate) {
      where.AND = [];
      if (startDate) {
        where.AND.push({ startDate: { gte: new Date(startDate) } });
      }
      if (endDate) {
        where.AND.push({ endDate: { lte: new Date(endDate) } });
      }
    }

    // Get total count
    const total = await prisma.campaign.count({ where });

    // Get campaigns with pagination
    const campaigns = await prisma.campaign.findMany({
      where,
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
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    const response: CampaignsResponse = {
      campaigns: campaigns as unknown as Campaign[], // Type assertion needed due to Prisma vs our type mismatch
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách chiến dịch" },
      { status: 500 }
    );
  }
}

// POST - Tạo chiến dịch mới
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validatedData = campaignSchema.parse(body);

    // Convert string dates to Date objects
    const campaignData = {
      ...validatedData,
      startDate: validatedData.startDate
        ? new Date(validatedData.startDate)
        : null,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      budget: validatedData.budget ? Number(validatedData.budget) : null,
      targetImpressions: validatedData.targetImpressions
        ? Number(validatedData.targetImpressions)
        : null,
      targetClicks: validatedData.targetClicks
        ? Number(validatedData.targetClicks)
        : null,
      targetConversions: validatedData.targetConversions
        ? Number(validatedData.targetConversions)
        : null,
      targetRevenue: validatedData.targetRevenue
        ? Number(validatedData.targetRevenue)
        : null,
      isFeatured: validatedData.isFeatured || false,
    };

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: campaignData,
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

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);

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
      { error: "Lỗi khi tạo chiến dịch" },
      { status: 500 }
    );
  }
}
