import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { ProductStatus, ProductCondition } from "@prisma/client";

// GET - Lấy thông tin sản phẩm theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Kiểm tra store có thuộc về seller này không
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found or unauthorized" },
        { status: 404 }
      );
    }

    const resolvedParams = await params;
    const product = await prisma.product.findFirst({
      where: {
        id: resolvedParams.id,
        storeId: store.id, // Đảm bảo chỉ lấy sản phẩm của store này
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        variants: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            reviews: true,
            wishlists: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Always return images, tags, variants as array and numbers as numbers
    const safeProduct = {
      ...product,
      images: Array.isArray(product.images) ? product.images : [],
      tags: Array.isArray(product.tags)
        ? product.tags
        : product.tags
          ? typeof product.tags === "string"
            ? JSON.parse(product.tags)
            : []
          : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
      originalPrice:
        typeof product.originalPrice === "number" ? product.originalPrice : 0,
      salePrice:
        typeof product.salePrice === "number" ? product.salePrice : undefined,
      stock: typeof product.stock === "number" ? product.stock : 0,
      category: product.category || { id: "", name: "—", slug: "" },
      brand: product.brand || null,
    };

    return NextResponse.json(safeProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật sản phẩm
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Kiểm tra store có thuộc về seller này không
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found or unauthorized" },
        { status: 404 }
      );
    }

    const resolvedParams = await params;

    // Kiểm tra sản phẩm tồn tại và thuộc store này
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: resolvedParams.id,
        storeId: store.id,
      },
      include: {
        images: true,
        variants: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    console.log("Update product request body:", JSON.stringify(body, null, 2));

    const {
      name,
      slug,
      description,
      shortDescription,
      categoryId,
      brandId,
      originalPrice,
      salePrice,
      sku,
      weight,
      length,
      width,
      height,
      stock,
      lowStockThreshold,
      status,
      condition,
      tags = [],
      metaTitle,
      metaDescription,
      metaKeywords,
      features,
      specifications,
      isDigital,
      isFeatured,
      requiresShipping,
      images = [],
      variants = [],
    } = body;

    // For partial updates, use existing values if not provided
    const updateData = {
      name: name || existingProduct.name,
      slug: slug || existingProduct.slug,
      description:
        description !== undefined ? description : existingProduct.description,
      shortDescription:
        shortDescription !== undefined
          ? shortDescription
          : existingProduct.shortDescription,
      categoryId: categoryId || existingProduct.categoryId,
      brandId: brandId !== undefined ? brandId : existingProduct.brandId,
      originalPrice:
        originalPrice !== undefined
          ? originalPrice
          : existingProduct.originalPrice,
      salePrice:
        salePrice !== undefined ? salePrice : existingProduct.salePrice,
      sku: sku !== undefined ? sku : existingProduct.sku,
      weight: weight !== undefined ? weight : existingProduct.weight,
      length: length !== undefined ? length : existingProduct.length,
      width: width !== undefined ? width : existingProduct.width,
      height: height !== undefined ? height : existingProduct.height,
      stock: stock !== undefined ? stock : existingProduct.stock,
      lowStockThreshold:
        lowStockThreshold !== undefined
          ? lowStockThreshold
          : existingProduct.lowStockThreshold,
      status: status || existingProduct.status,
      condition: condition || existingProduct.condition,
      tags:
        tags.length > 0
          ? tags
          : existingProduct.tags
            ? JSON.parse(existingProduct.tags)
            : [],
      metaTitle:
        metaTitle !== undefined ? metaTitle : existingProduct.metaTitle,
      metaDescription:
        metaDescription !== undefined
          ? metaDescription
          : existingProduct.metaDescription,
      metaKeywords:
        metaKeywords !== undefined
          ? metaKeywords
          : existingProduct.metaKeywords,
      features: features !== undefined ? features : existingProduct.features,
      specifications:
        specifications !== undefined
          ? specifications
          : existingProduct.specifications,
      isDigital:
        isDigital !== undefined ? isDigital : existingProduct.isDigital,
      isFeatured:
        isFeatured !== undefined ? isFeatured : existingProduct.isFeatured,
      requiresShipping:
        requiresShipping !== undefined
          ? requiresShipping
          : existingProduct.requiresShipping,
    };

    // Validation for required fields (only if they are being updated)
    if (name !== undefined && !name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (originalPrice !== undefined && originalPrice <= 0) {
      return NextResponse.json(
        { error: "Original price must be greater than 0" },
        { status: 400 }
      );
    }

    if (stock !== undefined && stock < 0) {
      return NextResponse.json(
        { error: "Stock cannot be negative" },
        { status: 400 }
      );
    }

    if (categoryId !== undefined && !categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    // Validate sale price
    if (
      salePrice !== undefined &&
      salePrice &&
      updateData.originalPrice &&
      salePrice >= updateData.originalPrice
    ) {
      return NextResponse.json(
        { error: "Sale price must be less than original price" },
        { status: 400 }
      );
    }

    // Check if SKU exists for other products in this store
    if (sku !== undefined && sku && sku.trim() && sku !== existingProduct.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: sku.trim(),
          storeId: store.id,
          status: { not: "INACTIVE" },
          id: { not: resolvedParams.id },
        },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: "SKU already exists in your store" },
          { status: 400 }
        );
      }
    }

    // Generate slug if not provided or different
    const finalSlug =
      slug ||
      updateData.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();

    // Check if slug exists for other products
    if (finalSlug !== existingProduct.slug) {
      const existingSlug = await prisma.product.findFirst({
        where: {
          slug: finalSlug,
          status: { not: "INACTIVE" },
          id: { not: resolvedParams.id },
        },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    // Handle product status based on store type and selected status
    let finalStatus: ProductStatus = updateData.status as ProductStatus;

    // If store is not OFFICIAL and trying to set status to ACTIVE
    if (store.type !== "OFFICIAL" && status === "ACTIVE") {
      finalStatus = "PENDING_APPROVAL";
    }

    console.log("Updating product with data:", {
      id: resolvedParams.id,
      name: updateData.name,
      finalSlug,
      originalPrice: updateData.originalPrice,
      salePrice: updateData.salePrice,
      stock: updateData.stock,
      finalStatus,
    });

    // Update product using transaction for data consistency
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update main product data
      const product = await tx.product.update({
        where: { id: resolvedParams.id },
        data: {
          name: updateData.name,
          slug: finalSlug,
          description: updateData.description,
          shortDescription: updateData.shortDescription,
          categoryId: updateData.categoryId,
          brandId: updateData.brandId,
          originalPrice: parseFloat(updateData.originalPrice.toString()),
          salePrice: updateData.salePrice
            ? parseFloat(updateData.salePrice.toString())
            : null,
          sku:
            updateData.sku && updateData.sku.trim()
              ? updateData.sku.trim()
              : null,
          weight: updateData.weight
            ? parseFloat(updateData.weight.toString())
            : null,
          length: updateData.length
            ? parseFloat(updateData.length.toString())
            : null,
          width: updateData.width
            ? parseFloat(updateData.width.toString())
            : null,
          height: updateData.height
            ? parseFloat(updateData.height.toString())
            : null,
          stock: parseInt(updateData.stock.toString()),
          lowStockThreshold: updateData.lowStockThreshold
            ? parseInt(updateData.lowStockThreshold.toString())
            : existingProduct.lowStockThreshold,
          status: finalStatus,
          condition: updateData.condition as ProductCondition,
          tags:
            updateData.tags.length > 0 ? JSON.stringify(updateData.tags) : null,
          metaTitle: updateData.metaTitle,
          metaDescription: updateData.metaDescription,
          metaKeywords: updateData.metaKeywords,
          features: updateData.features
            ? JSON.stringify(updateData.features)
            : null,
          specifications: updateData.specifications
            ? JSON.stringify(updateData.specifications)
            : null,
          isDigital: updateData.isDigital,
          isFeatured: updateData.isFeatured,
          requiresShipping: updateData.requiresShipping,
          publishedAt:
            finalStatus === "ACTIVE" && !existingProduct.publishedAt
              ? new Date()
              : existingProduct.publishedAt,
        },
      });

      // Update product images efficiently
      if (images && images.length > 0) {
        // Get current image URLs
        const currentImageUrls = existingProduct.images.map((img) => img.url);
        const newImageUrls = images.map(
          (img: { url: string; alt?: string; caption?: string }) => img.url
        );

        // Find images to delete (in current but not in new)
        const imagesToDelete = existingProduct.images.filter(
          (img) => !newImageUrls.includes(img.url)
        );

        // Delete removed images
        if (imagesToDelete.length > 0) {
          await tx.productImage.deleteMany({
            where: {
              id: { in: imagesToDelete.map((img) => img.id) },
            },
          });
        }

        // Create new images (not in current)
        const newImages = images.filter(
          (img: { url: string; alt?: string; caption?: string }) =>
            !currentImageUrls.includes(img.url)
        );

        if (newImages.length > 0) {
          await Promise.all(
            newImages.map(
              (
                image: { url: string; alt?: string; caption?: string },
                index: number
              ) =>
                tx.productImage.create({
                  data: {
                    productId: resolvedParams.id,
                    url: image.url,
                    alt: image.alt || product.name,
                    caption: image.caption,
                    order: existingProduct.images.length + index,
                    isMain: existingProduct.images.length === 0 && index === 0,
                  },
                })
            )
          );
        }

        // Update order and isMain for existing images
        await Promise.all(
          images.map(
            async (
              image: { url: string; alt?: string; caption?: string },
              index: number
            ) => {
              const existingImage = existingProduct.images.find(
                (img) => img.url === image.url
              );
              if (existingImage) {
                await tx.productImage.update({
                  where: { id: existingImage.id },
                  data: {
                    order: index,
                    isMain: index === 0,
                    alt: image.alt || product.name,
                    caption: image.caption,
                  },
                });
              }
            }
          )
        );
      }

      // Update product variants efficiently
      if (variants && variants.length > 0) {
        // Get current variant SKUs
        const newVariantSkus = variants.map(
          (v: {
            name: string;
            value: string;
            price?: number;
            stock: number;
            sku: string;
          }) => v.sku
        );

        // Find variants to delete (in current but not in new)
        const variantsToDelete = existingProduct.variants.filter(
          (v) => !newVariantSkus.includes(v.sku)
        );

        // Delete removed variants
        if (variantsToDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: {
              id: { in: variantsToDelete.map((v) => v.id) },
            },
          });
        }

        // Update existing variants and create new ones
        await Promise.all(
          variants.map(
            async (variant: {
              name: string;
              value: string;
              price?: number;
              stock: number;
              sku: string;
            }) => {
              const existingVariant = existingProduct.variants.find(
                (v) => v.sku === variant.sku
              );

              const variantData = {
                name: `${variant.name}: ${variant.value}`,
                sku: variant.sku,
                price: variant.price
                  ? parseFloat(variant.price.toString())
                  : null,
                stock: parseInt(variant.stock.toString()),
                attributes: JSON.stringify({ [variant.name]: variant.value }),
                isActive: true,
              };

              if (existingVariant) {
                // Update existing variant
                await tx.productVariant.update({
                  where: { id: existingVariant.id },
                  data: variantData,
                });
              } else {
                // Create new variant
                await tx.productVariant.create({
                  data: {
                    ...variantData,
                    productId: resolvedParams.id,
                  },
                });
              }
            }
          )
        );
      }

      return product;
    });

    // If status was changed to PENDING_APPROVAL, inform the user
    if (status === "ACTIVE" && finalStatus === "PENDING_APPROVAL") {
      return NextResponse.json({
        product: updatedProduct,
        message:
          "Sản phẩm đã được cập nhật và đang chờ duyệt trước khi đăng bán",
      });
    }

    return NextResponse.json({
      product: updatedProduct,
      message: "Sản phẩm đã được cập nhật thành công",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi cập nhật sản phẩm" },
      { status: 500 }
    );
  }
}

// DELETE - Xóa sản phẩm
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Kiểm tra store có thuộc về seller này không
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Store not found or unauthorized" },
        { status: 404 }
      );
    }

    const resolvedParams = await params;

    // Kiểm tra sản phẩm tồn tại và thuộc store này
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: resolvedParams.id,
        storeId: store.id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product has any orders
    const hasOrders = await prisma.orderItem.findFirst({
      where: { productId: resolvedParams.id },
    });

    // Check if product has any cart items
    const hasCartItems = await prisma.cartItem.findFirst({
      where: { productId: resolvedParams.id },
    });

    // Check if product has any reviews
    const hasReviews = await prisma.productReview.findFirst({
      where: { productId: resolvedParams.id },
    });

    // Determine if we can hard delete or need to soft delete
    const canHardDelete = !hasOrders && !hasCartItems && !hasReviews;

    if (canHardDelete) {
      // Hard delete if no dependencies
      await prisma.product.delete({
        where: { id: resolvedParams.id },
      });

      return NextResponse.json({
        message: "Sản phẩm đã được xóa hoàn toàn",
        deletedPermanently: true,
      });
    } else {
      // Soft delete - update status and add audit info
      await prisma.product.update({
        where: { id: resolvedParams.id },
        data: {
          status: "INACTIVE",
        },
      });

      return NextResponse.json({
        message: "Sản phẩm đã được ẩn (có lịch sử đơn hàng hoặc đánh giá)",
        deletedPermanently: false,
        reason: hasOrders
          ? "Có lịch sử đơn hàng"
          : hasCartItems
            ? "Có trong giỏ hàng"
            : hasReviews
              ? "Có đánh giá"
              : "Không xác định",
      });
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Có lỗi xảy ra khi xóa sản phẩm" },
      { status: 500 }
    );
  }
}
