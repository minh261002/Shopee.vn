import type { StoreBasic, ProductBasic, PaginationMeta } from "./common";

// Advanced Inventory Management
export interface InventoryLocation {
  id: string;
  name: string;
  code: string;
  address: string;
  lat?: number;
  lng?: number;

  storeId?: string;
  store?: StoreBasic;

  isActive: boolean;
  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;

  inventoryItems?: InventoryItem[];
  stockMovements?: StockMovement[];
  transfersTo?: StockMovement[];
}

export interface InventoryItem {
  id: string;
  locationId: string;
  location?: InventoryLocation;

  productId?: string;
  product?: ProductBasic;

  variantId?: string;
  variant?: {
    id: string;
    name: string;
    attributes: string;
  };

  quantity: number;
  reservedQty: number;
  availableQty: number;

  minStockLevel: number;
  maxStockLevel?: number;
  reorderPoint: number;

  avgCostPrice?: number;
  lastCostPrice?: number;

  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  locationId: string;
  location?: InventoryLocation;

  productId?: string;
  product?: ProductBasic;

  variantId?: string;
  variant?: {
    id: string;
    name: string;
    attributes: string;
  };

  type:
    | "IN"
    | "OUT"
    | "TRANSFER"
    | "ADJUSTMENT"
    | "RETURN"
    | "DAMAGED"
    | "EXPIRED";
  quantity: number;

  orderId?: string;
  order?: {
    id: string;
    orderNumber: string;
  };

  transferToLocationId?: string;
  transferToLocation?: InventoryLocation;

  unitCost?: number;
  totalCost?: number;

  reason?: string;
  referenceNumber?: string;

  createdBy?: string;
  createdAt: Date;
}

// Form Data Types
export interface InventoryLocationFormData {
  name: string;
  code: string;
  address: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface StockMovementFormData {
  locationId: string;
  productId?: string;
  variantId?: string;
  type:
    | "IN"
    | "OUT"
    | "TRANSFER"
    | "ADJUSTMENT"
    | "RETURN"
    | "DAMAGED"
    | "EXPIRED";
  quantity: number;
  transferToLocationId?: string;
  unitCost?: number;
  reason?: string;
  referenceNumber?: string;
}

// Response Types
export interface InventoryLocationsResponse {
  locations: InventoryLocation[];
  pagination: PaginationMeta;
}

export interface StockMovementsResponse {
  movements: StockMovement[];
  pagination: PaginationMeta;
}

// Filter Types
export interface InventoryFilters {
  locationId?: string;
  productId?: string;
  lowStock?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
}

// Analytics Types
export interface InventoryAnalytics {
  totalProducts: number;
  lowStockItems: number;
  totalValue: number;
  turnoverRate: number;
  topMovingProducts: Array<{
    productId: string;
    productName: string;
    totalMoved: number;
  }>;
}
