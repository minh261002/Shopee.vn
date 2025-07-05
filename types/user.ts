export interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: "USER" | "SELLER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  _count?: {
    sessions: number;
    accounts: number;
    addresses: number;
  };
}

export interface UserAddress {
  id: string;
  userId: string;
  address: string;
  type: "HOME" | "WORK" | "OTHER";
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsersResponse {
  users: UserData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: "USER" | "SELLER" | "ADMIN";
  image?: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: "USER" | "SELLER" | "ADMIN";
  image?: string;
  emailVerified?: boolean;
}

export interface CreateAddressRequest {
  address: string;
  type?: "HOME" | "WORK" | "OTHER";
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  address: string;
  type?: "HOME" | "WORK" | "OTHER";
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}
