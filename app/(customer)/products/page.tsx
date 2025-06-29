import connectDB from "@/config/database";
import makeSerializable from "@/utils/convertToObj";
import ProductsSection from "@/components/customerUI/productsPageContent/ProductsSection";
import { getCachedBrands, getCachedSizes} from "@/utils/getCachedLists";
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
    const filters = await loadSearchParams(searchParams);
    console.log('filters in products page', filters)
    const [brands, sizes] = await Promise.all([getCachedBrands() as Promise<Brand[]>, getCachedSizes() as Promise<Size[]>]);

    const productsDoc = await getProducts(filters, brands);
    const products = makeSerializable(productsDoc);

    const sizesValue = sizes.map((size) => size.value);
    const brandsName = brands.map((brand) => brand.name);

    return <ProductsSection products={products} sizes={sizesValue} brands={brandsName} />;
  } catch (error) {
    console.error("Failed to fetch products page data:", error);
    // Return a user-friendly error UI instead of crashing the page
    throw new Error("Could not load products, please try again.");
  }
};

export default ProductsPage;
