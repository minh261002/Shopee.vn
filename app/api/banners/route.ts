import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ContentPosition,
  ContentStatus,
  TargetAudience,
  GeographicTarget,
} from "@prisma/client";

// GET - Lấy banner cho frontend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const status = searchParams.get("status") || "PUBLISHED";
    const isActive = searchParams.get("isActive") !== "false"; // default true
    const limit = parseInt(searchParams.get("limit") || "10");

    // Device detection từ query hoặc user-agent
    const device = searchParams.get("device") || "desktop"; // mobile, tablet, desktop
    const targetAudience =
      (searchParams.get("targetAudience") as TargetAudience) || null;
    const geographicTarget =
      (searchParams.get("geographicTarget") as GeographicTarget) || null;

    if (!position) {
      return NextResponse.json(
        { error: "Position is required" },
        { status: 400 }
      );
    }

    // Xây dựng điều kiện tìm kiếm
    const where = {
      position: position as ContentPosition,
      status: status as ContentStatus,
      isActive: isActive,
      // Device targeting
      ...(device === "mobile" && { showOnMobile: true }),
      ...(device === "tablet" && { showOnTablet: true }),
      ...(device === "desktop" && { showOnDesktop: true }),
      // Audience targeting (nếu có)
      ...(targetAudience && { targetAudience }),
      ...(geographicTarget && { geographicTarget }),
      // Time conditions
      AND: [
        {
          OR: [{ startDate: null }, { startDate: { lte: new Date() } }],
        },
        {
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
      ],
    };

    // Lấy banner theo vị trí và điều kiện
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
            startDate: true,
            endDate: true,
            isFeatured: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: [
        { priority: "desc" }, // Ưu tiên cao nhất
        { createdAt: "desc" },
      ],
      take: limit,
    });

    // Filter thêm theo campaign active (nếu có campaign)
    const activeBanners = banners.filter((banner) => {
      if (!banner.campaign) return true; // Banner không thuộc campaign nào

      const campaign = banner.campaign;
      const now = new Date();

      // Kiểm tra campaign active
      if (campaign.status !== "PUBLISHED") return false;
      if (campaign.startDate && campaign.startDate > now) return false;
      if (campaign.endDate && campaign.endDate < now) return false;

      return true;
    });

    return NextResponse.json({
      banners: activeBanners,
      total: activeBanners.length,
      filters: {
        position,
        status,
        isActive,
        device,
        targetAudience,
        geographicTarget,
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
