import type {
  UserBasic,
  StoreBasic,
  ProductBasic,
  PaginationMeta,
} from "./common";

// Affiliate Marketing System
export interface Affiliate {
  id: string;
  userId: string;
  user?: UserBasic;

  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";

  defaultCommissionRate: number;

  bankAccount?: string;
  taxCode?: string;
  paymentEmail?: string;

  totalReferrals: number;
  totalCommission: number;
  unpaidCommission: number;

  applicationNote?: string;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: string;

  createdAt: Date;
  updatedAt: Date;

  affiliateLinks?: AffiliateLink[];
  commissions?: AffiliateCommission[];
  payouts?: AffiliatePayout[];
}

export interface AffiliateLink {
  id: string;
  affiliateId: string;
  affiliate?: Affiliate;

  productId?: string;
  product?: ProductBasic;

  storeId?: string;
  store?: StoreBasic;

  code: string;
  commissionRate?: number;

  clicks: number;
  conversions: number;
  revenue: number;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  commissions?: AffiliateCommission[];
}

export interface AffiliateCommission {
  id: string;
  affiliateId: string;
  affiliate?: Affiliate;

  orderId: string;
  order?: {
    id: string;
    orderNumber: string;
    total: number;
  };

  linkId?: string;
  link?: AffiliateLink;

  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;

  status: string; // pending, approved, paid
  paidAt?: Date;

  createdAt: Date;
}

export interface AffiliatePayout {
  id: string;
  affiliateId: string;
  affiliate?: Affiliate;

  amount: number;
  method: string;
  reference?: string;
  note?: string;

  status: string; // pending, processing, completed, failed
  processedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Form Data Types
export interface AffiliateFormData {
  applicationNote?: string;
  bankAccount?: string;
  taxCode?: string;
  paymentEmail?: string;
}

// Response Types
export interface AffiliatesResponse {
  affiliates: Affiliate[];
  pagination: PaginationMeta;
}

// Filter Types
export interface AffiliateFilters {
  status?: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  minCommission?: number;
  maxCommission?: number;
}

// Analytics Types
export interface AffiliateAnalytics {
  totalAffiliates: number;
  totalCommissions: number;
  avgCommissionRate: number;
  topPerformers: Array<{
    affiliateId: string;
    userName: string;
    totalCommission: number;
    conversions: number;
  }>;
}
