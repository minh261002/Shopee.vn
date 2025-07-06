import type { UserBasic, PaginationMeta } from "./common";

// Subscription & Premium Features
export interface Subscription {
  id: string;
  userId: string;
  user?: UserBasic;

  planId: string;
  plan?: SubscriptionPlan;

  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "SUSPENDED";

  startDate: Date;
  endDate: Date;

  amount: number;
  currency: string;

  autoRenew: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;

  price: number;
  currency: string;

  durationDays: number;

  features: string; // JSON

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;

  subscriptions?: Subscription[];
}

// Form Data Types
export interface SubscriptionPlanFormData {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  features: Record<string, unknown>;
}

// Response Types
export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  pagination: PaginationMeta;
}

export interface SubscriptionPlansResponse {
  plans: SubscriptionPlan[];
  pagination: PaginationMeta;
}

// Feature Types
export interface PlanFeatures {
  maxProducts: number;
  maxOrders: number;
  maxStorage: number; // in GB
  analytics: boolean;
  prioritySupport: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  advancedReports: boolean;
  multiStore: boolean;
  whiteLabel: boolean;
}
