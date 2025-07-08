import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  parentId: string | null;
  children?: Category[];
}

// Recursive function to get all nested children
async function getCategoryWithChildren(
  parentId: string | null = null
): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: {
      parentId: parentId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      parentId: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Recursively get children for each category
  const categoriesWithChildren: Category[] = await Promise.all(
    categories.map(async (category): Promise<Category> => {
      const children = await getCategoryWithChildren(category.id);
      return {
        ...category,
        children: children.length > 0 ? children : undefined,
      };
    })
  );

  return categoriesWithChildren;
}

export async function GET() {
  try {
    // Get root categories with all nested children
    const categories = await getCategoryWithChildren(null);

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi lấy danh mục" },
      { status: 500 }
    );
  }
}
