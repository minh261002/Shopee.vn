import type {
  UserBasic,
  StoreBasic,
  ProductBasic,
  CategoryBasic,
  PaginationMeta,
} from "./common";

// Advanced Analytics
export interface UserBehavior {
  id: string;
  userId?: string;
  user?: UserBasic;

  sessionId?: string;
  action: string;

  productId?: string;
  product?: ProductBasic;

  categoryId?: string;
  category?: CategoryBasic;

  storeId?: string;
  store?: StoreBasic;

  data?: string; // JSON

  deviceType?: string;
  browser?: string;
  os?: string;

  createdAt: Date;
}

// Search & Recommendations
export interface SearchQuery {
  id: string;
  query: string;
  userId?: string;
  user?: UserBasic;

  sessionId?: string;
  ipAddress?: string;

  resultCount: number;
  clickedProductId?: string;

  filters?: string; // JSON

  createdAt: Date;
}

export interface PopularSearch {
  id: string;
  query: string;
  searchCount: number;
  resultCount: number;

  lastSearched: Date;
}

export interface ProductRecommendation {
  id: string;
  type:
    | "VIEWED_TOGETHER"
    | "BOUGHT_TOGETHER"
    | "SIMILAR_PRODUCTS"
    | "PERSONALIZED"
    | "TRENDING"
    | "RECENTLY_VIEWED";

  sourceProductId?: string;
  sourceProduct?: ProductBasic;

  targetProductId: string;
  targetProduct?: ProductBasic;

  score: number;

  userId?: string;
  user?: UserBasic;

  createdAt: Date;
  updatedAt: Date;
}

// Social Features
export interface ProductShare {
  id: string;
  productId: string;
  product?: ProductBasic;

  userId?: string;
  user?: UserBasic;

  platform: string;
  sharedAt: Date;
}

export interface UserFollow {
  id: string;
  followerId: string;
  follower?: UserBasic;

  followingId: string;
  following?: UserBasic;

  createdAt: Date;
}

// Response Types
export interface UserBehaviorsResponse {
  behaviors: UserBehavior[];
  pagination: PaginationMeta;
}

export interface RecommendationsResponse {
  recommendations: ProductRecommendation[];
  pagination: PaginationMeta;
}

// Filter Types
export interface UserBehaviorFilters {
  action?: string;
  productId?: string;
  categoryId?: string;
  storeId?: string;
  deviceType?: string;
  startDate?: string;
  endDate?: string;
}

// Analytics Dashboard Types
export interface DashboardAnalytics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;

  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;

  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;

  topCategories: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;

  topStores: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;

  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;

  deviceBreakdown: Array<{
    device: string;
    percentage: number;
    users: number;
  }>;

  trafficSources: Array<{
    source: string;
    percentage: number;
    users: number;
  }>;
}

export interface ProductAnalytics {
  totalViews: number;
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageRating: number;
  totalReviews: number;

  viewsByDay: Array<{
    date: string;
    views: number;
  }>;

  salesByDay: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;

  demographicBreakdown: {
    ageGroups: Array<{
      range: string;
      percentage: number;
    }>;
    genderBreakdown: Array<{
      gender: string;
      percentage: number;
    }>;
    locationBreakdown: Array<{
      city: string;
      percentage: number;
    }>;
  };
}

export interface StoreAnalytics {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageOrderValue: number;
  conversionRate: number;
  customerRetentionRate: number;

  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;

  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;

  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
  }>;

  salesByChannel: Array<{
    channel: string;
    sales: number;
    revenue: number;
  }>;
}
