// Export all types from separate files

// Common types
export * from "./common";

// Advanced features (new types that don't conflict)
export * from "./live-stream";
export * from "./flash-sale";
export * from "./affiliate";
export * from "./inventory";
export * from "./analytics";
export * from "./subscription";
export * from "./seo";

// Core business types remain in their original files
// Import from specific files when needed:
// - Store types: import from "./store"
// - Banner types: import from "./banner"
// - Campaign types: import from "./campaign"
// - Category types: import from "./category"
// - User types: import from "./user"

// Re-export commonly used types with aliases for convenience
export type {
  UserBasic as User,
  StoreBasic as Store,
  ProductBasic as Product,
  CategoryBasic as Category,
  PaginationMeta as Pagination,
} from "./common";
