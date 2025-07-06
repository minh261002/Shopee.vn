import type { ProductBasic, PaginationMeta } from "./common";

// Flash Sales & Time-limited Deals
export interface FlashSale {
  id: string;
  name: string;
  description?: string;
  bannerImage?: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";

  startTime: Date;
  endTime: Date;

  maxQuantityPerUser?: number;
  minOrderAmount?: number;

  createdAt: Date;
  updatedAt: Date;

  flashSaleItems?: FlashSaleItem[];
}

export interface FlashSaleItem {
  id: string;
  flashSaleId: string;
  flashSale?: FlashSale;

  productId: string;
  product?: ProductBasic;

  originalPrice: number;
  salePrice: number;
  discountPercent: number;

  totalQuantity: number;
  soldQuantity: number;
  remainingQuantity: number;

  maxPerUser: number;
  priority: number;

  createdAt: Date;
  updatedAt: Date;
}

// Form Data Types
export interface FlashSaleFormData {
  name: string;
  description?: string;
  bannerImage?: string;
  startTime: string;
  endTime: string;
  maxQuantityPerUser?: number;
  minOrderAmount?: number;
}

export interface FlashSaleItemFormData {
  productId: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  totalQuantity: number;
  maxPerUser: number;
  priority?: number;
}

// Response Types
export interface FlashSalesResponse {
  flashSales: FlashSale[];
  pagination: PaginationMeta;
}

// Filter Types
export interface FlashSaleFilters {
  status?: "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";
  startDate?: string;
  endDate?: string;
}

// Analytics Types
export interface FlashSaleAnalytics {
  totalSales: number;
  totalRevenue: number;
  avgDiscountPercent: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    soldQuantity: number;
    revenue: number;
  }>;
}
