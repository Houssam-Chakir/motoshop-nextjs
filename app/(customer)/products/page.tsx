import connectDB from "@/config/database";
import makeSerializable from "@/utils/convertToObj";
import ProductsSection from "@/components/customerUI/productsPageContent/ProductsSection";
import { getCachedBrands } from "@/utils/getCachedLists";
import { getProducts } from "@/actions/productsActions";
import { SearchParams } from "nuqs/server";
import { loadSearchParams } from "@/lib/searchParams";
import { revalidateTag } from "next/cache";

type PageProps = {
  searchParams: Promise<SearchParams>;
};


const ProductsPage = async ({ searchParams }: PageProps) => {
  try {
    await connectDB();
    const [filters, brands] = await Promise.all([loadSearchParams(searchParams), getCachedBrands()]);
    const { productsDoc, sizes, pagination } = await getProducts(filters, { brands });

    async function refetchProducts() {
      'use server'
      revalidateTag('products')
    }

    const brandsName = brands.map((brand) => brand.name);
    const products = makeSerializable(productsDoc);

    return <ProductsSection refetchProducts={refetchProducts} products={products} sizes={sizes} brands={brandsName} pagination={pagination} />;
  } catch (error) {
    console.error("Failed to fetch products page data:", error);
    // Return a user-friendly error UI instead of crashing the page
    throw new Error("Could not load products, please try again.");
  }
};

export default ProductsPage;
