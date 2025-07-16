import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  // Xoá tất cả data cũ trước khi seed
  console.log("🧹 Cleaning up old data...");
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.inventoryLocation.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shippingRate.deleteMany();
  await prisma.shippingProvider.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Old data cleaned up");

  // 1. User (buyer, seller, admin)
  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      emailVerified: true,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  const sellers = await Promise.all(
    Array.from({ length: 2 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          emailVerified: true,
          role: "SELLER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    )
  );
  const buyers = await Promise.all(
    Array.from({ length: 3 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          emailVerified: true,
          role: "USER",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    )
  );

  // 2. Store cho seller
  const stores = await Promise.all(
    sellers.map((seller, i) =>
      prisma.store.create({
        data: {
          name: faker.company.name(),
          slug: faker.helpers.slugify(faker.company.name()).toLowerCase() + i,
          status: "ACTIVE",
          type: "INDIVIDUAL",
          ownerId: seller.id,
          address: faker.location.streetAddress(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    )
  );

  // 3. Category
  const categoryData = [
    {
      name: "Thời Trang Nam",
      slug: "thoi-trang-nam",
      image: "https://picsum.photos/48/48?random=1",
      featured: true,
    },
    {
      name: "Điện Thoại & Phụ Kiện",
      slug: "dien-thoai-phu-kien",
      image: "https://picsum.photos/48/48?random=2",
      featured: true,
    },
    {
      name: "Thiết Bị Điện Tử",
      slug: "thiet-bi-dien-tu",
      image: "https://picsum.photos/48/48?random=3",
      featured: true,
    },
    {
      name: "Máy Tính & Laptop",
      slug: "may-tinh-laptop",
      image: "https://picsum.photos/48/48?random=4",
      featured: true,
    },
    {
      name: "Máy Ảnh & Máy Quay Phim",
      slug: "may-anh-may-quay-phim",
      image: "https://picsum.photos/48/48?random=5",
      featured: true,
    },
    {
      name: "Đồng Hồ",
      slug: "dong-ho",
      image: "https://picsum.photos/48/48?random=6",
      featured: true,
    },
    {
      name: "Giày Dép Nam",
      slug: "giay-dep-nam",
      image: "https://picsum.photos/48/48?random=7",
      featured: true,
    },
    {
      name: "Thiết Bị Điện Gia Dụng",
      slug: "thiet-bi-dien-gia-dung",
      image: "https://picsum.photos/48/48?random=8",
      featured: true,
    },
    {
      name: "Thể Thao & Du Lịch",
      slug: "the-thao-du-lich",
      image: "https://picsum.photos/48/48?random=9",
      featured: true,
    },
    {
      name: "Ô Tô & Xe Máy & Xe Đạp",
      slug: "o-to-xe-may-xe-dap",
      image: "https://picsum.photos/48/48?random=10",
      featured: true,
    },
    {
      name: "Thời Trang Nữ",
      slug: "thoi-trang-nu",
      image: "https://picsum.photos/48/48?random=11",
      featured: true,
    },
    {
      name: "Mẹ & Bé",
      slug: "me-be",
      image: "https://picsum.photos/48/48?random=12",
      featured: true,
    },
    {
      name: "Nhà Cửa & Đời Sống",
      slug: "nha-cua-doi-song",
      image: "https://picsum.photos/48/48?random=13",
      featured: true,
    },
    {
      name: "Sắc Đẹp",
      slug: "sac-dep",
      image: "https://picsum.photos/48/48?random=14",
      featured: true,
    },
    {
      name: "Sức Khỏe",
      slug: "suc-khoe",
      image: "https://picsum.photos/48/48?random=15",
      featured: true,
    },
    {
      name: "Giày Dép Nữ",
      slug: "giay-dep-nu",
      image: "https://picsum.photos/48/48?random=16",
      featured: true,
    },
    {
      name: "Túi Ví Nữ",
      slug: "tui-vi-nu",
      image: "https://picsum.photos/48/48?random=17",
      featured: true,
    },
    {
      name: "Phụ Kiện & Trang Sức Nữ",
      slug: "phu-kien-trang-suc-nu",
      image: "https://picsum.photos/48/48?random=18",
      featured: true,
    },
    {
      name: "Bách Hóa Online",
      slug: "bach-hoa-online",
      image: "https://picsum.photos/48/48?random=19",
      featured: true,
    },
    {
      name: "Nhà Sách Online",
      slug: "nha-sach-online",
      image: "https://picsum.photos/48/48?random=20",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },

    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-1",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-2",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-3",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-4",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-5",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-6",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },

    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-7",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-9",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-8",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-19",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-10",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },

    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-11",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
    {
      name: "Đồ Chơi & Game",
      slug: "do-choi-game-12",
      image: "https://picsum.photos/48/48?random=21",
      featured: true,
    },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) =>
      prisma.category.create({
        data: cat,
      })
    )
  );

  // 4. Brand
  const brands = await Promise.all(
    Array.from({ length: 2 }).map(() =>
      prisma.brand.create({
        data: {
          name: faker.company.name(),
          slug:
            faker.helpers.slugify(faker.company.name()).toLowerCase() +
            faker.string.alphanumeric(3),
          description: faker.company.catchPhrase(),
          logo: faker.image.avatar(),
        },
      })
    )
  );

  // 5. Product & ProductVariant cho mỗi store
  for (const store of stores) {
    for (let i = 0; i < 3; i++) {
      const product = await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          slug:
            faker.helpers.slugify(faker.commerce.productName()).toLowerCase() +
            faker.string.alphanumeric(3),
          description: faker.commerce.productDescription(),
          status: "ACTIVE",
          condition: "NEW",
          storeId: store.id,
          categoryId: categories[i % categories.length].id,
          brandId: brands[i % brands.length].id,
          originalPrice: Number(
            faker.commerce.price({ min: 100000, max: 1000000 })
          ),
          salePrice: Number(faker.commerce.price({ min: 50000, max: 900000 })),
          stock: faker.number.int({ min: 10, max: 100 }),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      // ProductVariant
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: "Default",
          sku: faker.string.alphanumeric(8),
          price: product.salePrice,
          stock: product.stock,
          attributes: JSON.stringify({ color: "red", size: "M" }),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  // 6. InventoryLocation & InventoryItem cho mỗi store
  for (const store of stores) {
    const location = await prisma.inventoryLocation.create({
      data: {
        name: "Kho " + store.name,
        code: "KHO" + faker.string.alphanumeric(4),
        address: faker.location.streetAddress(),
        storeId: store.id,
        isActive: true,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const products = await prisma.product.findMany({
      where: { storeId: store.id },
    });
    for (const product of products) {
      await prisma.inventoryItem.create({
        data: {
          locationId: location.id,
          productId: product.id,
          quantity: product.stock,
          reservedQty: 0,
          availableQty: product.stock,
        },
      });
    }
  }

  // 7. ShippingProvider & ShippingRate
  const providers = await Promise.all(
    Array.from({ length: 2 }).map(() =>
      prisma.shippingProvider.create({
        data: {
          name: faker.company.name(),
          code: faker.string.alphanumeric(5).toUpperCase(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    )
  );
  for (const provider of providers) {
    await prisma.shippingRate.create({
      data: {
        providerId: provider.id,
        name: "Gói tiêu chuẩn",
        method: "STANDARD",
        basePrice: 30000,
        perKgPrice: 5000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // 8. Order, OrderItem, Shipment, Payment cho buyer
  for (const buyer of buyers) {
    const store = stores[0];
    const product = await prisma.product.findFirst({
      where: { storeId: store.id },
    });
    if (!product) continue;
    const order = await prisma.order.create({
      data: {
        orderNumber: faker.string.alphanumeric(10).toUpperCase(),
        status: "PAID",
        paymentStatus: "PAID",
        paymentMethod: "COD",
        userId: buyer.id,
        storeId: store.id,
        subtotal: product.originalPrice,
        shippingFee: 30000,
        tax: 0,
        discount: 0,
        total: product.originalPrice + 30000,
        shippingAddress: faker.location.streetAddress(),
        shippingCountry: "Vietnam",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: 1,
        unitPrice: product.originalPrice,
        totalPrice: product.originalPrice,
        productName: product.name,
      },
    });
    const provider = providers[0];
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        providerId: provider.id,
        method: "STANDARD",
        status: "DELIVERED",
        pickupAddress: store.address,
        deliveryAddress: faker.location.streetAddress(),
        shippingFee: 30000,
        totalFee: 30000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: product.originalPrice + 30000,
        method: "COD",
        status: "PAID",
        paidAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // 9. Cart, CartItem cho buyer
  for (const buyer of buyers) {
    const cart = await prisma.cart.create({
      data: {
        userId: buyer.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    const product = await prisma.product.findFirst();
    if (product) {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: 2,
        },
      });
    }
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
