// Shared types for admin functionality
export interface AdminProductFilters {
  search?: string;
  brand?: string;
  category?: string;
  type?: string;
  stockStatus?: "all" | "in_stock" | "low_stock" | "out_of_stock";
  sort?: "title" | "sku" | "price" | "stock" | "created";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AdminProduct {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  barcode: string;
  images: { secure_url: string; public_id: string }[];
  brand: { _id: string; name: string };
  category: { _id: string; name: string; section: string };
  type: { _id: string; name: string };
  retailPrice: number;
  salePrice?: number;
  wholesalePrice: number;
  stock: {
    _id: string;
    sizes: { size: string; quantity: number }[];
  } | null;
  totalStock: number;
  stockStatus: "in_stock" | "low_stock" | "out_of_stock";
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductsResponse {
  products: AdminProduct[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

export interface FilterOptions {
  brands: { _id: string; name: string }[];
  categories: { _id: string; name: string; section: string }[];
  types: { _id: string; name: string }[];
}
