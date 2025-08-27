"use server";

import { unstable_cache as nextCache } from "next/cache";

// Re-export types from shared types file
export type { AdminProductFilters, AdminProduct, AdminProductsResponse, FilterOptions } from "@/types/admin";

/**
 * Get products for admin inventory management
 */
export const getAdminProducts = nextCache(
  async (filters: any = {}): Promise<any> => {
    const connectDB = (await import("@/config/database")).default;
    const Product = (await import("@/models/Product")).default;

    await connectDB();

    const { search, brand, category, type, stockStatus = "all", sort = "title", sortOrder = "asc", page = 0, limit = 25 } = filters;

    try {
      // Build query
      const query: any = {};

      // Search across title, sku, and barcode
      if (search) {
        const regex = new RegExp(search, "i");
        query.$or = [{ title: regex }, { sku: regex }, { barcode: regex }];
      }

      if (brand) {
        query.brand = brand;
      }

      if (category) {
        query.category = category;
      }

      if (type) {
        query.type = type;
      }

      // Build sort options
      let sortOptions: any = {};
      switch (sort) {
        case "title":
          sortOptions = { title: sortOrder === "asc" ? 1 : -1 };
          break;
        case "sku":
          sortOptions = { sku: sortOrder === "asc" ? 1 : -1 };
          break;
        case "price":
          sortOptions = { retailPrice: sortOrder === "asc" ? 1 : -1 };
          break;
        case "created":
          sortOptions = { createdAt: sortOrder === "asc" ? 1 : -1 };
          break;
        default:
          sortOptions = { title: 1 };
      }

      // Get products with full population
      const products = await Product.find(query)
        .populate("brand", "name")
        .populate("category", "name section")
        .populate("type", "name")
        .populate("stock", "sizes")
        .populate("saleInfo", "discountType discountValue isActive startDate endDate")
        .sort(sortOptions)
        .skip(page * limit)
        .limit(limit)
        .lean();

      // Transform products and calculate stock info
      const transformedProducts: any[] = products.map((product: any) => {
        const totalStock = product.stock?.sizes?.reduce((total: number, size: any) => total + (size.quantity || 0), 0) || 0;

        let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "out_of_stock";
        if (totalStock > 10) {
          stockStatus = "in_stock";
        } else if (totalStock > 0) {
          stockStatus = "low_stock";
        }

        // Calculate sale price if applicable
        let salePrice = undefined;
        if (product.saleInfo?.isActive) {
          const now = new Date();
          const saleStart = new Date(product.saleInfo.startDate);
          const saleEnd = new Date(product.saleInfo.endDate);

          if (now >= saleStart && now <= saleEnd) {
            if (product.saleInfo.discountType === "percentage") {
              salePrice = product.retailPrice * (1 - product.saleInfo.discountValue / 100);
            } else if (product.saleInfo.discountType === "fixed_amount") {
              salePrice = Math.max(0, product.retailPrice - product.saleInfo.discountValue);
            }
          }
        }

        return {
          _id: product._id.toString(),
          title: product.title || "",
          sku: product.sku || "",
          barcode: product.barcode || "",
          productModel: product.productModel || "",
          description: product.description || "",
          images: product.images || [],
          brand: product.brand
            ? {
                _id: product.brand._id.toString(),
                name: product.brand.name,
              }
            : null,
          category: product.category
            ? {
                _id: product.category._id.toString(),
                name: product.category.name,
                section: product.category.section,
              }
            : null,
          type: product.type
            ? {
                _id: product.type._id.toString(),
                name: product.type.name,
              }
            : null,
          retailPrice: product.retailPrice || 0,
          salePrice,
          wholesalePrice: product.wholesalePrice || 0,
          season: product.season || "",
          style: product.style || "",
          stock: product.stock
            ? {
                sizes: product.stock.sizes || [],
              }
            : null,
          totalStock,
          stockStatus,
          createdAt: product.createdAt?.toISOString() || "",
          updatedAt: product.updatedAt?.toISOString() || "",
        };
      });

      // Filter by stock status if specified
      const filteredProducts = stockStatus === "all" ? transformedProducts : transformedProducts.filter((p) => p.stockStatus === stockStatus);

      // Get total count for pagination
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

      return {
        products: filteredProducts,
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
      console.error("Error fetching admin products:", error);
      throw new Error("Failed to fetch products for admin");
    }
  },
  ["admin-products"],
  {
    tags: ["products", "admin"],
    revalidate: 300, // 5 minutes
  }
);

/**
 * Get filter options for admin inventory
 */
export const getAdminFilterOptions = nextCache(
  async () => {
    const connectDB = (await import("@/config/database")).default;
    const Brand = (await import("@/models/Brand")).default;
    const Category = (await import("@/models/Category")).default;
    const TypeModel = (await import("@/models/Type")).default;

    await connectDB();

    try {
      const [brands, categories, types] = await Promise.all([
        Brand.find({}).select("_id name").lean(),
        Category.find({}).select("_id name section").lean(),
        TypeModel.find({}).select("_id name").lean(),
      ]);

      return {
        brands: brands.map((b) => ({ _id: (b._id as any).toString(), name: b.name })),
        categories: categories.map((c) => ({
          _id: (c._id as any).toString(),
          name: c.name,
          section: c.section,
        })),
        types: types.map((t) => ({ _id: (t._id as any).toString(), name: t.name })),
      };
    } catch (error) {
      console.error("Error fetching filter options:", error);
      throw new Error("Failed to fetch filter options");
    }
  },
  ["admin-filter-options"],
  {
    tags: ["brands", "categories", "types"],
    revalidate: 3600, // 1 hour
  }
);

/**
 * Bulk update stock for multiple products
 */
export async function bulkUpdateStock(updates: Record<string, Record<string, number>>) {
  const connectDB = (await import("@/config/database")).default;
  const Product = (await import("@/models/Product")).default;
  const Stock = (await import("@/models/Stock")).default;

  await connectDB();

  try {
    const results = [];

    for (const [productId, sizeUpdates] of Object.entries(updates)) {
      // Get the product's stock document
      const product = await Product.findById(productId).populate("stock").lean();

      if (!product || !(product as any).stock) {
        continue;
      }

      // Update the stock sizes
      const stockId = ((product as any).stock as any)._id;
      const updateOperations = [];

      for (const [size, quantity] of Object.entries(sizeUpdates)) {
        updateOperations.push({
          updateOne: {
            filter: {
              _id: stockId,
              "sizes.size": size,
            },
            update: {
              $set: {
                "sizes.$.quantity": quantity,
              },
            },
          },
        });
      }

      if (updateOperations.length > 0) {
        await Stock.bulkWrite(updateOperations);
        results.push(productId);
      }
    }

    return { success: true, updatedProducts: results.length };
  } catch (error) {
    console.error("Error bulk updating stock:", error);
    throw new Error("Failed to update stock for products");
  }
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProducts(productIds: string[]) {
  const connectDB = (await import("@/config/database")).default;
  const Product = (await import("@/models/Product")).default;
  const Stock = (await import("@/models/Stock")).default;

  await connectDB();

  try {
    // Delete associated stock documents first
    const products = await Product.find({ _id: { $in: productIds } })
      .select("stock")
      .lean();
    const stockIds = products.map((p) => p.stock).filter(Boolean);

    if (stockIds.length > 0) {
      await Stock.deleteMany({ _id: { $in: stockIds } });
    }

    // Delete the products
    const result = await Product.deleteMany({ _id: { $in: productIds } });

    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    throw new Error("Failed to delete products");
  }
}

/**
 * Delete a single product
 */
export async function deleteProduct(productId: string) {
  const connectDB = (await import("@/config/database")).default;
  const Product = (await import("@/models/Product")).default;
  const Stock = (await import("@/models/Stock")).default;

  await connectDB();

  try {
    // Get product to find associated stock
    const product = await Product.findById(productId).select("stock").lean();

    if (!product) {
      throw new Error("Product not found");
    }

    // Delete associated stock if exists
    if ((product as any).stock) {
      await Stock.findByIdAndDelete((product as any).stock);
    }

    // Delete the product
    await Product.findByIdAndDelete(productId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
}
