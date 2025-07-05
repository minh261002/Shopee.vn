export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  featured: boolean;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
    slug: string;
  };
  children?: {
    id: string;
    name: string;
    slug: string;
  }[];
  _count?: {
    children: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
