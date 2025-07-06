// Common types used across the application

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressData {
  address: string;
  ward?: string;
  district?: string;
  city?: string;
  country?: string;
  lat?: number; // Google Maps latitude
  lng?: number; // Google Maps longitude
  phone?: string;
  contactName?: string;
}

export interface LocationData {
  latitude?: number;
  longitude?: number;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
  country: string;
}

// Basic user info for relations
export interface UserBasic {
  id: string;
  name: string;
  email: string;
  image?: string;
}

// Basic store info for relations
export interface StoreBasic {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  rating: number;
  isVerified: boolean;
}

// Basic product info for relations
export interface ProductBasic {
  id: string;
  name: string;
  slug: string;
  originalPrice: number;
  salePrice?: number;
  stock: number;
}

// Basic category info for relations
export interface CategoryBasic {
  id: string;
  name: string;
  slug: string;
}
