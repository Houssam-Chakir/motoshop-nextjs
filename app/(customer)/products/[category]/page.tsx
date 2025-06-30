import connectDB from "@/config/database";
import makeSerializable from "@/utils/convertToObj";
import ProductsSection from "@/components/customerUI/productsPageContent/ProductsSection";
import { getCachedBrands, getCachedSizes } from "@/utils/getCachedLists";
import { getProducts } from "@/actions/productsActions";
import { SearchParams } from "nuqs/server";
import { loadSearchParams } from "@/lib/searchParams";
import Category from "@/models/Category";

interface Brand {
  _id: string;
  name: string;
}
interface ProductType {
  _id: string;
  name: string;
}
interface Size {
  _id: string;
  value: string;
}
type PageProps = {
  searchParams: Promise<SearchParams>;
  params: { category: string };
};
const ProductsPage = async ({ params, searchParams }: PageProps) => {
  try {
    await connectDB();

    const { category } = params;
    const categoryDoc = await Category.findOne({ slug: category });
    const categoryId = categoryDoc._id.toString();

    const [filters, brands] = await Promise.all([loadSearchParams(searchParams), getCachedBrands()]);
    const { productsDoc, sizes, pagination } = await getProducts(filters, { brands, categoryId });

    const brandsName = brands.map((brand) => brand.name);
    const products = makeSerializable(productsDoc);

    return <ProductsSection products={products} sizes={sizes} brands={brandsName} pagination={pagination} />;
  } catch (error) {
    console.error("Failed to fetch products page data:", error);
    // Return a user-friendly error UI instead of crashing the page
    throw new Error("Could not load products, please try again.");
  }
};

export default ProductsPage;
