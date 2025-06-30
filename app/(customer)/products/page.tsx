import connectDB from "@/config/database";
import makeSerializable from "@/utils/convertToObj";
import ProductsSection from "@/components/customerUI/productsPageContent/ProductsSection";
import { getCachedBrands, getCachedSizes } from "@/utils/getCachedLists";
import { getProducts } from "@/actions/productsActions";
import { SearchParams } from "nuqs/server";
import { loadSearchParams } from "@/lib/searchParams";

interface Brand {
  _id: string;
  name: string;
}
interface Size {
  _id: string;
  value: string;
}
type PageProps = {
  searchParams: Promise<SearchParams>;
};

const ProductsPage = async ({ searchParams }: PageProps) => {
  try {
    await connectDB();
    const [filters, brands] = await Promise.all([loadSearchParams(searchParams), getCachedBrands()]);
    const { productsDoc, sizes } = await getProducts(filters, { brands });

    const brandsName = brands.map((brand) => brand.name);
    const products = makeSerializable(productsDoc);

    return <ProductsSection products={products} sizes={sizes} brands={brandsName} />;
  } catch (error) {
    console.error("Failed to fetch products page data:", error);
    // Return a user-friendly error UI instead of crashing the page
    throw new Error("Could not load products, please try again.");
  }
};

export default ProductsPage;
