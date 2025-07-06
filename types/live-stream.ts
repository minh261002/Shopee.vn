import type { UserBasic, StoreBasic, PaginationMeta } from "./common";

// Live Streaming & Video Commerce
export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  streamUrl?: string;
  status: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";

  hostId: string;
  host?: UserBasic;

  storeId?: string;
  store?: StoreBasic;

  scheduledAt: Date;
  startedAt?: Date;
  endedAt?: Date;

  maxViewers: number;
  totalViews: number;

  products?: string; // JSON array of product IDs

  isRecorded: boolean;
  recordUrl?: string;

  createdAt: Date;
  updatedAt: Date;

  streamViews?: StreamView[];
  streamChats?: StreamChat[];
}

export interface StreamView {
  id: string;
  streamId: string;
  stream?: LiveStream;

  userId?: string;
  user?: UserBasic;

  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;

  joinedAt: Date;
  leftAt?: Date;
  duration?: number; // in seconds
}

export interface StreamChat {
  id: string;
  streamId: string;
  stream?: LiveStream;

  userId?: string;
  user?: UserBasic;

  message: string;
  isHost: boolean;
  isPinned: boolean;

  createdAt: Date;
}

// Form Data Types
export interface LiveStreamFormData {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  scheduledAt: string;
  storeId?: string;
  products?: string[];
  isRecorded?: boolean;
}

// Response Types
export interface LiveStreamsResponse {
  streams: LiveStream[];
  pagination: PaginationMeta;
}

// Filter Types
export interface LiveStreamFilters {
  status?: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED";
  hostId?: string;
  storeId?: string;
  startDate?: string;
  endDate?: string;
}

// Analytics Types
export interface LiveStreamAnalytics {
  totalStreams: number;
  totalViews: number;
  totalHours: number;
  avgViewersPerStream: number;
  conversionRate: number;
}
