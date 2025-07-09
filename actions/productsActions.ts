import { FilterQuery, Types } from "mongoose";
import Product, { ProductDocument } from "@/models/Product";
import Sale, { SaleDocument } from "@/models/Sale";
import connectDB from "@/config/database";
import { unstable_cache as next_cache } from "next/cache";

// Re-export the SaleDocument type for use in other files
export type { SaleDocument } from "@/models/Sale";

type ImageType = { secure_url: string; public_id: string };
type CategoryType = { _id: Types.ObjectId; name: string };
// Define more specific types for Stock and Banner to replace 'any'
type StockType = { quantity: number; inStock: boolean }; // Example type
type BannerType = string; // Example type for banner URL

// Define types for the transformed product with sale info
export interface ProductWithSale {
  _id: string;
  name: string;
  slug: string;
  description: string;
  images: ImageType[];
  category: Types.ObjectId | CategoryType;
  stock: StockType | null;
  originalPrice: number;
  salePrice: number;
  discount: number;
  discountPercentage: number;
  isOnSale: boolean;
  currentSale: {
    _id: string;
    name: string;
    color: string;
    banner: BannerType | null;
    discountType: "percentage" | "fixed_amount";
    discountValue: number;
  } | null;
}

// Generic type for a lean product document from the database
type LeanProductDocument = {
  _id: Types.ObjectId;
  name: string;
  slug?: string;
  description?: string;
  images: ImageType[];
  category: Types.ObjectId | CategoryType;
  stock?: StockType;
  price: number; // Represents either retailPrice or price
  retailPrice?: number; // retailPrice might also exist
  saleInfo?: (SaleDocument & { _id: Types.ObjectId }) | null;
};

// Reusable helper function to transform a lean product document
function transformProduct(product: LeanProductDocument): ProductWithSale {
  const sale = product.saleInfo;
  const originalPrice = product.retailPrice ?? product.price;

  let salePrice = originalPrice;
  let discount = 0;
  let discountPercentage = 0;

  if (sale) {
    if (sale.discountType === "percentage") {
      salePrice = originalPrice * (1 - sale.discountValue / 100);
      discount = originalPrice - salePrice;
      discountPercentage = sale.discountValue;
    } else if (sale.discountType === "fixed_amount") {
      salePrice = Math.max(0, originalPrice - sale.discountValue);
      discount = originalPrice - salePrice;
      if (originalPrice > 0) {
        discountPercentage = Math.round((discount / originalPrice) * 100);
      }
    }
  }

  return {
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug || "",
    description: product.description || "",
    images: product.images || [],
    category: product.category,
    stock: product.stock || null,
    originalPrice,
    salePrice: Math.round(salePrice * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    discountPercentage,
    isOnSale: !!sale,
    currentSale: sale
      ? {
          _id: sale._id.toString(),
          name: sale.name,
          color: sale.color,
          banner: sale.banner || null,
          discountType: sale.discountType as "percentage" | "fixed_amount",
          discountValue: sale.discountValue,
        }
      : null,
  };
}

// Define types for pagination options
interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  sizes?: string[];
  styles?: string[];
}

interface paramType {
  _id: string;
  name: string;
}
interface filtersType {
  sort?: string;
  type?: string[];
  brand?: string[];
  size?: string[];
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
  searchQuery?: string; // Add searchQuery for text search
}

interface filterInfo {
  brands: paramType[];
  categoryId?: string;
  typeId?: string;
}

//f// GET PRODUCTS ///////////////////////////////////////////////////////////////////////////////
/**
 * Fetches products with their active sale information.
 * @param {FilterQuery<ProductDocument>} [filters={}] - Optional Mongoose query filters to apply.
 * @returns {Promise<ProductWithSale[]>} A promise that resolves to an array of products with sale details.
 * @throws {Error} If there is an issue fetching the products.
 */
export const getProducts = next_cache(
  async (filters: filtersType, { brands, categoryId = "", typeId = "" }: filterInfo) => {
    await connectDB();
    try {
      console.log("filters form server action", filters);
      const brandIds = brands.filter((brand) => filters.brand?.includes(brand.name)).map((brand) => brand._id);
      const sizeFilters = filters.size || [];
      const { page, limit, style, searchQuery } = filters;

      // Build the MongoDB query
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const query: Record<string, any> = {};

      // Handle text search query
      if (searchQuery) {
        const regex = new RegExp(searchQuery, "i");
        query.$or = [{ title: regex }, { slug: regex }, { description: regex }];
      }

      if (brandIds.length > 0) {
        query.brand = { $in: brandIds };
      }

      if (categoryId) {
        query.category = { $in: categoryId };
      }
      if (typeId) {
        query.type = { $in: typeId };
      }
      if (style && style.length > 0) {
        query.style = { $in: style };
      }

      if (filters.minPrice > 0 || filters.maxPrice < 30000) {
        query.retailPrice = { $gte: filters.minPrice, $lte: filters.maxPrice };
      }

      // Build the sort object
      let sortOptions = {};
      switch (filters.sort) {
        case "newest":
          sortOptions = { createdAt: -1 };
          break;
        case "price-asc":
          sortOptions = { retailPrice: 1 };
          break;
        case "price-desc":
          sortOptions = { retailPrice: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
          break;
      }

      const currentDate = new Date();

      // Light query ONLY for getting distinct sizes
      const productsForSizes = await Product.find(query)
        .select("_id") // Only select the minimum needed for populate to work
        .populate({
          path: "stock",
          select: "sizes", // Only get sizes from stock
        })
        .lean();

      // Extract unique sizes
      const distinctSizes = [...new Set(productsForSizes.flatMap((product: any) => product?.stock?.sizes?.map((s: { size?: string }) => s?.size).filter(Boolean) || []))];

      // Main paginated query for actual products
      const products = await Product.find(query)
        .sort(sortOptions)
        .skip(page * limit)
        .limit(limit)
        .select("title retailPrice images identifiers slug inStock saleInfo")
        .populate<{ saleInfo: SaleDocument | null }>({
          path: "saleInfo",
          match: { isActive: true, startDate: { $lte: currentDate }, endDate: { $gte: currentDate } },
          select: "name discountType discountValue startDate endDate isActive",
        })
        .populate({
          path: "stock",
          match: {},
          select: "sizes",
        })
        .populate([
          { path: "brand", select: "name" },
          { path: "type", select: "name" },
        ])
        .lean({ virtuals: true });

      // Apply size filtering to paginated results (if needed)
      const filteredProducts =
        sizeFilters.length > 0
          ? products.filter(
              (product: any) =>
                Array.isArray(product?.stock?.sizes) && product.stock.sizes.some((s: { size?: string }) => s && typeof s.size === "string" && sizeFilters.includes(s.size))
            )
          : products;

      // Get total count for pagination metadata (if needed)
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

      return {
        productsDoc: filteredProducts,
        sizes: distinctSizes,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page + 1 < totalPages,
          hasPrevPage: page > 0,
          limit,
        },
      };
    } catch (error) {
      console.error("Error fetching products with sales:", error);
      throw new Error("Failed to fetch products with sales");
    }
  },
  ["products"],
  {
    tags: ["products"],
  }
);

//f// GET PRODUCT DETAILS ///////////////////////////////////////////////////////////////////////////////
/**
 * Fetches a single product by its slug, along with active sale information.
 * @param {string | Types.ObjectId} slug - The ID of the product to fetch.
 * @returns {Promise<ProductWithSale | null>} A promise that resolves to the product with sale details, or null if not found.
 * @throws {Error} If there is an issue fetching the product.
 */
export async function getProduct(slug: string | Types.ObjectId) {
  await connectDB();
  try {
    const currentDate = new Date();
    const product = await Product.findOne({ slug: slug })
      .populate<{ saleInfo: SaleDocument | null }>({
        path: "saleInfo",
        match: { isActive: true, startDate: { $lte: currentDate }, endDate: { $gte: currentDate } },
        select: "name discountType discountValue startDate endDate isActive",
      })
      .populate({
        path: "stock",
        select: "sizes",
      })
      .populate([
        { path: "brand", select: "name" },
        { path: "type", select: "name" },
        { path: "category", select: "name" },
      ])
      .lean({ virtuals: true });

    return product;
  } catch (error) {
    console.error("Error fetching product with sales:", error);
    throw new Error("Failed to fetch product with sales");
  }
}

/**
 * Fetches products belonging to a specific category, with pagination and sale information.
 * @param {string | Types.ObjectId} categoryId - The ID of the category.
 * @param {PaginationOptions} [options={}] - Pagination and sorting options.
 * @returns {Promise<{ products: ProductWithSale[]; total: number; pages: number }>} A promise that resolves to an object containing the products, total count, and page count.
 * @throws {Error} If there is an issue fetching the products.
 */
export async function getProductsByCategoryWithSales(
  categoryId: string | Types.ObjectId,
  options: PaginationOptions = {}
): Promise<{ products: ProductWithSale[]; total: number; pages: number }> {
  await connectDB();
  try {
    const currentDate = new Date();
    const { page = 1, limit = 10, sortBy = "name", sortOrder = "asc" } = options;
    const query: FilterQuery<ProductDocument> = { category: categoryId };
    const sort: { [key: string]: "asc" | "desc" } = { [sortBy]: sortOrder };

    const products = await Product.find(query)
      .select("name retailPrice images category slug stock description saleInfo")
      .populate<{ saleInfo: SaleDocument | null }>({
        path: "saleInfo",
        match: { isActive: true, startDate: { $lte: currentDate }, endDate: { $gte: currentDate } },
        select: "name discountType discountValue color banner startDate endDate",
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort(sort as any)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<LeanProductDocument[]>();

    const total = await Product.countDocuments(query);
    const transformedProducts = products.map(transformProduct);

    return {
      products: transformedProducts,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching products by category with sales:", error);
    throw new Error("Failed to fetch products by category with sales");
  }
}

/**
 * Fetches a list of products that are currently on sale.
 * @param {number} [limit=10] - The maximum number of products to return.
 * @returns {Promise<ProductWithSale[]>} A promise that resolves to an array of products on sale.
 * @throws {Error} If there is an issue fetching the products.
 */
export async function getProductsOnSale(limit: number = 10): Promise<ProductWithSale[]> {
  await connectDB();
  try {
    const currentDate = new Date();
    const activeSales = await Sale.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
    });

    if (activeSales.length === 0) return [];

    const productIds = activeSales.flatMap((sale: SaleDocument) => sale.applicableProducts.map((id: Types.ObjectId) => id.toString()));
    if (productIds.length === 0) return [];

    const products = await Product.find({ _id: { $in: productIds } })
      .select("name price images category slug stock description saleInfo")
      .populate<{ saleInfo: SaleDocument | null }>({
        path: "saleInfo",
        match: { isActive: true, startDate: { $lte: currentDate }, endDate: { $gte: currentDate } },
        select: "name discountType discountValue color banner",
      })
      .limit(limit)
      .lean<LeanProductDocument[]>();

    const productsWithSales = products.filter((product) => product.saleInfo).map(transformProduct);

    return productsWithSales;
  } catch (error) {
    console.error("Error fetching products on sale:", error);
    throw new Error("Failed to fetch products on sale");
  }
}

/**
 * Associates a sale with a product.
 * @param {string} productId - The ID of the product to update.
 * @param {string} saleId - The ID of the sale to associate.
 * @returns {Promise<ProductDocument>} A promise that resolves to the updated product document.
 * @throws {Error} If the product is not found.
 */
export async function updateProductSale(productId: string, saleId: string): Promise<ProductDocument> {
  await connectDB();
  const product = await Product.findByIdAndUpdate(productId, { $set: { saleInfo: saleId } }, { new: true });
  if (!product) {
    throw new Error(`Product with ID ${productId} not found.`);
  }
  return product;
}

/**
 * Removes a sale association from a product.
 * @param {string} productId - The ID of the product to update.
 * @returns {Promise<ProductDocument>} A promise that resolves to the updated product document.
 * @throws {Error} If the product is not found.
 */
export async function removeProductSale(productId: string): Promise<ProductDocument> {
  await connectDB();
  const product = await Product.findByIdAndUpdate(productId, { $unset: { saleInfo: "" } }, { new: true });
  if (!product) {
    throw new Error(`Product with ID ${productId} not found.`);
  }
  return product;
}
