import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// GET - Lấy danh sách categories cho frontend
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "100"); // Tăng limit mặc định
    const search = searchParams.get("search");

    // Xây dựng điều kiện tìm kiếm
    const where: Prisma.CategoryWhereInput = {};

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.name = {
        contains: search,
      };
    }

    const categories = await prisma.category.findMany({
      where,
      take: limit,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
