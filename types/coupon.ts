export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING" | "CASHBACK";
  scope: "PLATFORM_WIDE" | "CATEGORY" | "BRAND" | "FIRST_ORDER" | "NEW_USER";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  totalLimit?: number;
  userLimit?: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  categoryIds?: string;
  brandIds?: string;
  storeIds?: string;
  userGroupIds?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponsResponse {
  coupons: Coupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  createdAt: Date;
  coupon: Coupon;
  user: {
    id: string;
    name: string;
    email: string;
  };
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
  };
}

export interface CouponUsageResponse {
  usages: CouponUsage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateCouponRequest {
  code: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING" | "CASHBACK";
  scope: "PLATFORM_WIDE" | "CATEGORY" | "BRAND" | "FIRST_ORDER" | "NEW_USER";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  totalLimit?: number;
  userLimit?: number;
  startDate: Date;
  endDate: Date;
  categoryIds?: string[];
  brandIds?: string[];
  storeIds?: string[];
  userGroupIds?: string[];
  isActive: boolean;
}

export interface UpdateCouponRequest extends Partial<CreateCouponRequest> {
  id: string;
}
