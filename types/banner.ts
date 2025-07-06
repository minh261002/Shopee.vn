export interface ContentItem {
  id: string;
  contentBlockId: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image: string;
  imageAlt?: string;
  linkUrl?: string;
  linkText?: string;
  openInNewTab: boolean;
  productId?: string;
  categoryId?: string;
  brandId?: string;
  order: number;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentBlock {
  id: string;
  title: string;
  description?: string;
  type:
    | "HERO_BANNER"
    | "FLASH_SALE_BANNER"
    | "CATEGORY_BANNER"
    | "BRAND_BANNER"
    | "PRODUCT_BANNER"
    | "PROMOTION_BANNER"
    | "SEASONAL_BANNER"
    | "SIDEBAR_BANNER"
    | "CHECKOUT_BANNER"
    | "CART_BANNER"
    | "SEARCH_BANNER";
  status:
    | "DRAFT"
    | "PUBLISHED"
    | "SCHEDULED"
    | "ARCHIVED"
    | "PAUSED"
    | "EXPIRED";
  position:
    | "HOMEPAGE_HERO"
    | "HOMEPAGE_FEATURED"
    | "HOMEPAGE_SIDEBAR"
    | "CATEGORY_HEADER"
    | "CATEGORY_SIDEBAR"
    | "PRODUCT_DETAIL_TOP"
    | "PRODUCT_DETAIL_SIDEBAR"
    | "CHECKOUT_PAGE"
    | "CART_PAGE"
    | "SEARCH_RESULTS"
    | "FLASH_SALE_PAGE"
    | "BRAND_PAGE";
  priority: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  targetAudience:
    | "ALL_USERS"
    | "NEW_USERS"
    | "RETURNING_USERS"
    | "PREMIUM_USERS"
    | "MOBILE_USERS"
    | "DESKTOP_USERS"
    | "SPECIFIC_LOCATION"
    | "SPECIFIC_DEVICE";
  geographicTarget:
    | "ALL_VIETNAM"
    | "NORTH_VIETNAM"
    | "CENTRAL_VIETNAM"
    | "SOUTH_VIETNAM"
    | "HANOI"
    | "HO_CHI_MINH"
    | "DA_NANG"
    | "SPECIFIC_CITY";
  targetLocations?: string;
  targetDevices?: string;
  targetCategories?: string;
  targetUserGroups?: string;
  abTestGroup?: string;
  abTestWeight: number;
  abTestName?: string;
  backgroundColor?: string;
  textColor?: string;
  customCSS?: string;
  showOnMobile: boolean;
  showOnTablet: boolean;
  showOnDesktop: boolean;
  clickTracking: boolean;
  impressionTracking: boolean;
  conversionTracking: boolean;
  isFlashSale: boolean;
  flashSaleEndTime?: string;
  discountPercent?: number;
  originalPrice?: number;
  salePrice?: number;
  createdAt: string;
  updatedAt: string;
  campaignId?: string;
  createdBy?: string;
  updatedBy?: string;
  items: ContentItem[];
  campaign?: {
    id: string;
    name: string;
    status: string;
  };
  _count?: {
    items: number;
  };
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status:
    | "DRAFT"
    | "PUBLISHED"
    | "SCHEDULED"
    | "ARCHIVED"
    | "PAUSED"
    | "EXPIRED";
  startDate?: string;
  endDate?: string;
  budget?: number;
  targetImpressions?: number;
  targetClicks?: number;
  targetConversions?: number;
  targetRevenue?: number;
  targetAudience:
    | "ALL_USERS"
    | "NEW_USERS"
    | "RETURNING_USERS"
    | "PREMIUM_USERS"
    | "MOBILE_USERS"
    | "DESKTOP_USERS"
    | "SPECIFIC_LOCATION"
    | "SPECIFIC_DEVICE";
  geographicTarget:
    | "ALL_VIETNAM"
    | "NORTH_VIETNAM"
    | "CENTRAL_VIETNAM"
    | "SOUTH_VIETNAM"
    | "HANOI"
    | "HO_CHI_MINH"
    | "DA_NANG"
    | "SPECIFIC_CITY";
  targetLocations?: string;
  targetDevices?: string;
  targetCategories?: string;
  conditions?: string;
  campaignType?: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  banners: ContentBlock[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
