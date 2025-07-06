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
  campaignType?: "FLASH_SALE" | "SEASONAL" | "BRAND";
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  contentBlocks?: ContentBlock[];
  _count?: {
    contentBlocks: number;
  };
}

export interface ContentBlock {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  position: string;
  priority: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  targetAudience: string;
  geographicTarget: string;
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
}

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

export interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CampaignFilters {
  status?:
    | "DRAFT"
    | "PUBLISHED"
    | "SCHEDULED"
    | "ARCHIVED"
    | "PAUSED"
    | "EXPIRED";
  campaignType?: "FLASH_SALE" | "SEASONAL" | "BRAND";
  targetAudience?:
    | "ALL_USERS"
    | "NEW_USERS"
    | "RETURNING_USERS"
    | "PREMIUM_USERS"
    | "MOBILE_USERS"
    | "DESKTOP_USERS"
    | "SPECIFIC_LOCATION"
    | "SPECIFIC_DEVICE";
  geographicTarget?:
    | "ALL_VIETNAM"
    | "NORTH_VIETNAM"
    | "CENTRAL_VIETNAM"
    | "SOUTH_VIETNAM"
    | "HANOI"
    | "HO_CHI_MINH"
    | "DA_NANG"
    | "SPECIFIC_CITY";
  isFeatured?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  status?:
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
  targetAudience?:
    | "ALL_USERS"
    | "NEW_USERS"
    | "RETURNING_USERS"
    | "PREMIUM_USERS"
    | "MOBILE_USERS"
    | "DESKTOP_USERS"
    | "SPECIFIC_LOCATION"
    | "SPECIFIC_DEVICE";
  geographicTarget?:
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
  campaignType?: "FLASH_SALE" | "SEASONAL" | "BRAND";
  isFeatured?: boolean;
}

export interface UpdateCampaignData extends Partial<CreateCampaignData> {
  id: string;
}

// Status options for display
export const CAMPAIGN_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bản nháp", color: "gray" },
  { value: "PUBLISHED", label: "Đã xuất bản", color: "green" },
  { value: "SCHEDULED", label: "Đã lên lịch", color: "blue" },
  { value: "ARCHIVED", label: "Đã lưu trữ", color: "yellow" },
  { value: "PAUSED", label: "Tạm dừng", color: "orange" },
  { value: "EXPIRED", label: "Hết hạn", color: "red" },
] as const;

// Campaign type options
export const CAMPAIGN_TYPE_OPTIONS = [
  { value: "FLASH_SALE", label: "Flash Sale", icon: "⚡" },
  { value: "SEASONAL", label: "Theo mùa", icon: "🍂" },
  { value: "BRAND", label: "Thương hiệu", icon: "🏷️" },
] as const;

// Target audience options
export const TARGET_AUDIENCE_OPTIONS = [
  { value: "ALL_USERS", label: "Tất cả người dùng" },
  { value: "NEW_USERS", label: "Người dùng mới" },
  { value: "RETURNING_USERS", label: "Người dùng quay lại" },
  { value: "PREMIUM_USERS", label: "Người dùng Premium" },
  { value: "MOBILE_USERS", label: "Người dùng Mobile" },
  { value: "DESKTOP_USERS", label: "Người dùng Desktop" },
  { value: "SPECIFIC_LOCATION", label: "Vị trí cụ thể" },
  { value: "SPECIFIC_DEVICE", label: "Thiết bị cụ thể" },
] as const;

// Geographic target options
export const GEOGRAPHIC_TARGET_OPTIONS = [
  { value: "ALL_VIETNAM", label: "Toàn Việt Nam" },
  { value: "NORTH_VIETNAM", label: "Miền Bắc" },
  { value: "CENTRAL_VIETNAM", label: "Miền Trung" },
  { value: "SOUTH_VIETNAM", label: "Miền Nam" },
  { value: "HANOI", label: "Hà Nội" },
  { value: "HO_CHI_MINH", label: "TP.HCM" },
  { value: "DA_NANG", label: "Đà Nẵng" },
  { value: "SPECIFIC_CITY", label: "Thành phố cụ thể" },
] as const;
