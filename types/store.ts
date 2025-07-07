import {
  StoreStatus,
  StoreType,
  VerificationStatus,
  DocumentType,
  ProductStatus,
  ProductCondition,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  PromotionType,
  PromotionStatus,
} from "@prisma/client";

import type { PaginationMeta, AddressData, UserBasic } from "./common";

// Store Types
export interface StoreData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: "PENDING_APPROVAL" | "ACTIVE" | "SUSPENDED" | "CLOSED" | "BANNED";
  type: "INDIVIDUAL" | "BUSINESS" | "CORPORATION" | "OFFICIAL";
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
  logo?: string;
  banner?: string;
  email?: string;
  phone?: string;
  website?: string;
  businessName?: string;
  businessAddress?: string;
  taxCode?: string;
  businessLicense?: string;
  address: string;
  ward?: string;
  city?: string;
  country: string;
  lat?: number;
  lng?: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  followerCount: number;
  returnPolicy?: string;
  shippingPolicy?: string;
  warrantyPolicy?: string;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  isOfficialStore: boolean;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: StoreStatus;
  type: StoreType;
  verificationStatus: VerificationStatus;

  // Store owner
  ownerId: string;

  // Store information
  logo?: string;
  banner?: string;
  phone?: string;
  email?: string;
  website?: string;

  // Business information
  businessLicense?: string;
  taxCode?: string;
  businessName?: string;
  businessAddress?: string;

  // Location
  address: string;
  ward?: string;
  district?: string;
  city?: string;
  country: string;
  latitude?: number;
  longitude?: number;

  // Statistics
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  followerCount: number;

  // Store policies
  returnPolicy?: string;
  shippingPolicy?: string;
  warrantyPolicy?: string;

  // Operating status
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  isOfficialStore: boolean;

  // Social media
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface StoreWithOwner extends Store {
  owner: UserBasic;
}

export interface StoreWithStats extends Store {
  _count: {
    products: number;
    orders: number;
    storeReviews: number;
    storeFollowers: number;
  };
}

// Store Document Types
export interface StoreDocument {
  id: string;
  storeId: string;
  type: DocumentType;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  status: VerificationStatus;
  reviewNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  status: ProductStatus;
  condition: ProductCondition;

  // Store relation
  storeId: string;

  // Category relation
  categoryId: string;

  // Brand information
  brandId?: string;

  // Pricing
  originalPrice: number;
  salePrice?: number;
  costPrice?: number;
  discountPercent?: number;

  // Inventory
  stock: number;
  lowStockThreshold: number;
  sku?: string;
  barcode?: string;

  // Physical properties
  weight?: number;
  length?: number;
  width?: number;
  height?: number;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;

  // Product features
  features?: string; // JSON
  specifications?: string; // JSON
  tags?: string; // JSON array

  // Statistics
  viewCount: number;
  purchaseCount: number;
  rating: number;
  reviewCount: number;
  wishlistCount: number;

  // Flags
  isFeatured: boolean;
  isDigital: boolean;
  requiresShipping: boolean;

  // Dates
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithRelations extends Product {
  store: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    rating: number;
    isVerified: boolean;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt?: string;
  caption?: string;
  order: number;
  isMain: boolean;
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  price?: number;
  stock: number;
  attributes: string; // JSON
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;

  // Customer information
  userId?: string;

  // Store information
  storeId: string;

  // Guest checkout info
  guestEmail?: string;
  guestPhone?: string;
  guestName?: string;

  // Pricing
  subtotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  total: number;

  // Shipping information
  shippingAddress: string;
  shippingWard?: string;
  shippingDistrict?: string;
  shippingCity?: string;
  shippingCountry: string;
  shippingPhone?: string;
  shippingName?: string;
  shippingLat?: number; // Google Maps latitude
  shippingLng?: number; // Google Maps longitude

  // Billing information
  billingAddress?: string;
  billingWard?: string;
  billingDistrict?: string;
  billingCity?: string;
  billingCountry?: string;
  billingPhone?: string;
  billingName?: string;
  billingLat?: number; // Google Maps latitude
  billingLng?: number; // Google Maps longitude

  // Order tracking
  trackingNumber?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;

  // Notes
  customerNote?: string;
  adminNote?: string;

  // Cancellation
  cancelReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithRelations extends Order {
  user?: UserBasic;
  store: {
    id: string;
    name: string;
    slug: string;
  };
  items: OrderItemWithProduct[];
  payments: Payment[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productImage?: string;
  variantName?: string;
  createdAt: Date;
}

export interface OrderItemWithProduct extends OrderItem {
  product: {
    id: string;
    name: string;
    slug: string;
    images: ProductImage[];
  };
  variant?: {
    id: string;
    name: string;
    attributes: string;
  };
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gatewayResponse?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    originalPrice: number;
    salePrice?: number;
    stock: number;
    images: ProductImage[];
    store: {
      id: string;
      name: string;
      slug: string;
    };
  };
  variant?: {
    id: string;
    name: string;
    price?: number;
    stock: number;
    attributes: string;
  };
}

// Review Types
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string; // JSON array
  isVerified: boolean;
  isHelpful: number;
  isApproved: boolean;
  moderatedBy?: string;
  moderatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductReviewWithUser extends ProductReview {
  user: UserBasic;
}

export interface StoreReview {
  id: string;
  storeId: string;
  userId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  productQuality?: number;
  serviceQuality?: number;
  shippingSpeed?: number;
  communicationQuality?: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreReviewWithUser extends StoreReview {
  user: UserBasic;
}

// Promotion Types
export interface StorePromotion {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  type: PromotionType;
  status: PromotionStatus;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usagePerUser?: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  conditions?: string; // JSON
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface StoreAnalytics {
  id: string;
  storeId: string;
  date: Date;
  pageViews: number;
  uniqueVisitors: number;
  newFollowers: number;
  orders: number;
  revenue: number;
  averageOrderValue: number;
  productViews: number;
  addToCart: number;
  checkouts: number;
  createdAt: Date;
}

export interface ProductAnalytics {
  id: string;
  productId: string;
  date: Date;
  views: number;
  addToCart: number;
  purchases: number;
  wishlist: number;
  createdAt: Date;
}

// Form Data Types
export interface StoreFormData {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
  businessName?: string;
  businessAddress?: string;
  taxCode?: string;
  returnPolicy?: string;
  shippingPolicy?: string;
  warrantyPolicy?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  brandId?: string;
  originalPrice: number;
  salePrice?: number;
  stock: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  features?: Record<string, unknown>; // JSON object
  specifications?: Record<string, unknown>; // JSON object
  tags?: string[];
  isFeatured: boolean;
  isDigital: boolean;
  requiresShipping: boolean;
  condition: ProductCondition;
}

// Filter Types
export interface StoreFilters {
  status?: StoreStatus;
  type?: StoreType;
  city?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  minRating?: number;
  search?: string;
}

export interface ProductFilters {
  storeId?: string;
  categoryId?: string;
  brandId?: string;
  status?: ProductStatus;
  condition?: ProductCondition;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: "name" | "price" | "rating" | "createdAt" | "popularity";
  sortOrder?: "asc" | "desc";
}

export interface OrderFilters {
  storeId?: string;
  userId?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

// Response Types
export interface StoresResponse {
  stores: StoreWithStats[];
  pagination: PaginationMeta;
}

export interface ProductsResponse {
  products: ProductWithRelations[];
  pagination: PaginationMeta;
}

export interface OrdersResponse {
  orders: OrderWithRelations[];
  pagination: PaginationMeta;
}

// Shipping Types
export interface ShippingProvider {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  apiKey?: string;
  apiSecret?: string;
  apiUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingRate {
  id: string;
  providerId: string;
  method: "STANDARD" | "EXPRESS" | "SAME_DAY" | "PICKUP" | "DRONE_DELIVERY";
  name: string;
  fromCity?: string;
  toCity?: string;
  fromLat?: number; // Google Maps latitude
  fromLng?: number; // Google Maps longitude
  toLat?: number; // Google Maps latitude
  toLng?: number; // Google Maps longitude
  minWeight?: number;
  maxWeight?: number;
  minValue?: number;
  maxValue?: number;
  basePrice: number;
  perKgPrice: number;
  freeShippingThreshold?: number;
  estimatedDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shipment {
  id: string;
  orderId: string;
  providerId: string;
  method: "STANDARD" | "EXPRESS" | "SAME_DAY" | "PICKUP" | "DRONE_DELIVERY";
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "FAILED_DELIVERY"
    | "RETURNED_TO_SENDER";
  trackingNumber?: string;
  providerOrderId?: string;

  // Pickup details
  pickupAddress: string;
  pickupPhone?: string;
  pickupContact?: string;
  pickupDate?: Date;
  pickupLat?: number; // Google Maps latitude
  pickupLng?: number; // Google Maps longitude

  // Delivery details
  deliveryAddress: string;
  deliveryPhone?: string;
  deliveryContact?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  deliveryLat?: number; // Google Maps latitude
  deliveryLng?: number; // Google Maps longitude

  // Package details
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  packageValue?: number;

  // Fees
  shippingFee: number;
  codFee?: number;
  insuranceFee?: number;
  totalFee: number;

  // Notes
  specialInstructions?: string;
  deliveryNote?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentTracking {
  id: string;
  shipmentId: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PICKED_UP"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "FAILED_DELIVERY"
    | "RETURNED_TO_SENDER";
  location?: string;
  description?: string;
  timestamp: Date;
  lat?: number; // Google Maps latitude
  lng?: number; // Google Maps longitude
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type:
    | "ORDER_CONFIRMED"
    | "ORDER_SHIPPED"
    | "ORDER_DELIVERED"
    | "PAYMENT_RECEIVED"
    | "PAYMENT_FAILED"
    | "PRODUCT_REVIEW"
    | "STORE_REVIEW"
    | "PROMOTION_STARTED"
    | "STOCK_LOW"
    | "ACCOUNT_VERIFIED"
    | "SYSTEM_ANNOUNCEMENT"
    | "MARKETING";
  channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
  title: string;
  content: string;
  data?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface NotificationTemplate {
  id: string;
  type:
    | "ORDER_CONFIRMED"
    | "ORDER_SHIPPED"
    | "ORDER_DELIVERED"
    | "PAYMENT_RECEIVED"
    | "PAYMENT_FAILED"
    | "PRODUCT_REVIEW"
    | "STORE_REVIEW"
    | "PROMOTION_STARTED"
    | "STOCK_LOW"
    | "ACCOUNT_VERIFIED"
    | "SYSTEM_ANNOUNCEMENT"
    | "MARKETING";
  channel: "IN_APP" | "EMAIL" | "SMS" | "PUSH";
  title: string;
  content: string;
  variables?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Coupon Types
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

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  createdAt: Date;
}

// Return Types
export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  reason:
    | "DEFECTIVE_PRODUCT"
    | "WRONG_ITEM"
    | "NOT_AS_DESCRIBED"
    | "DAMAGED_SHIPPING"
    | "CHANGED_MIND"
    | "SIZE_ISSUE"
    | "OTHER";
  description: string;
  status:
    | "REQUESTED"
    | "APPROVED"
    | "REJECTED"
    | "SHIPPED_BACK"
    | "RECEIVED"
    | "REFUNDED"
    | "CANCELLED";
  returnAmount: number;
  refundMethod?: string;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  returnTrackingNumber?: string;
  returnShippedAt?: Date;
  returnReceivedAt?: Date;
  refundedAmount?: number;
  refundedAt?: Date;
  refundReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReturnItem {
  id: string;
  returnRequestId: string;
  orderItemId: string;
  quantity: number;
  reason:
    | "DEFECTIVE_PRODUCT"
    | "WRONG_ITEM"
    | "NOT_AS_DESCRIBED"
    | "DAMAGED_SHIPPING"
    | "CHANGED_MIND"
    | "SIZE_ISSUE"
    | "OTHER";
  condition?: string;
  createdAt: Date;
}

// Loyalty Program Types
export interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  pointsPerVND: number;
  pointsValue: number;
  minimumRedeemPoints: number;
  pointsExpiryDays?: number;
  enableTiers: boolean;
  tierThresholds?: string;
  tierMultipliers?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyAccount {
  id: string;
  userId: string;
  totalPoints: number;
  availablePoints: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  currentTier?: string;
  tierProgress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointsHistory {
  id: string;
  loyaltyAccountId: string;
  type:
    | "EARNED_PURCHASE"
    | "EARNED_REVIEW"
    | "EARNED_REFERRAL"
    | "EARNED_SIGNUP"
    | "REDEEMED_DISCOUNT"
    | "REDEEMED_CASHBACK"
    | "EXPIRED"
    | "ADJUSTED";
  points: number;
  description: string;
  orderId?: string;
  expiresAt?: Date;
  createdAt: Date;
}

// Support Types
export interface FAQ {
  id: string;
  category:
    | "ORDERING"
    | "PAYMENT"
    | "SHIPPING"
    | "RETURNS"
    | "ACCOUNT"
    | "SELLER"
    | "GENERAL";
  question: string;
  answer: string;
  isPublished: boolean;
  order: number;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  orderId?: string;
  assignedTo?: string;
  assignedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: string;
  message: string;
  attachments?: string;
  isInternal: boolean;
  createdAt: Date;
}

// Additional Response Types
export interface ShipmentsResponse {
  shipments: Shipment[];
  pagination: PaginationMeta;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: PaginationMeta;
}

export interface CouponsResponse {
  coupons: Coupon[];
  pagination: PaginationMeta;
}

export interface ReturnRequestsResponse {
  returnRequests: ReturnRequest[];
  pagination: PaginationMeta;
}

export interface SupportTicketsResponse {
  tickets: SupportTicket[];
  pagination: PaginationMeta;
}

// Additional Form Data Types
export interface ShippingAddressFormData extends AddressData {
  isDefault?: boolean;
  type?: "HOME" | "WORK" | "OTHER";
}

export interface ShipmentFormData {
  providerId: string;
  method: "STANDARD" | "EXPRESS" | "SAME_DAY" | "PICKUP" | "DRONE_DELIVERY";
  pickupAddress: AddressData;
  deliveryAddress: AddressData;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  packageValue?: number;
  specialInstructions?: string;
}
