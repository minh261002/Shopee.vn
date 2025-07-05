import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { Role, Prisma, AddressType } from "@prisma/client";

// GET - Lấy danh sách users
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
    const role = searchParams.get("role") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role) {
      where.role = role as Role;
    }

    // Count total records
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            sessions: true,
            accounts: true,
            addresses: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Tạo user mới
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role, image, addresses } = body;

    // Validation
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["USER", "SELLER", "ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name: name as string,
        email: email as string,
        role: role as Role,
        image: image || null,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Tạo địa chỉ nếu có
    if (addresses && Array.isArray(addresses) && addresses.length > 0) {
      interface AddressData {
        address: string;
        type?: string;
        lat?: number;
        lng?: number;
        isDefault?: boolean;
      }

      const addressData = addresses
        .filter((addr: AddressData) => addr.address && addr.address.trim())
        .map((addr: AddressData) => ({
          userId: user.id,
          address: addr.address.trim(),
          type: (addr.type as AddressType) || AddressType.HOME,
          lat: addr.lat || null,
          lng: addr.lng || null,
          isDefault: addr.isDefault || false,
        }));

      if (addressData.length > 0) {
        // Nếu có địa chỉ mặc định, bỏ mặc định của các địa chỉ khác
        const hasDefault = addressData.some((addr) => addr.isDefault);
        if (hasDefault) {
          addressData.forEach((addr) => {
            if (!addr.isDefault) {
              addr.isDefault = false;
            }
          });
        }

        await prisma.userAddress.createMany({
          data: addressData,
        });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
