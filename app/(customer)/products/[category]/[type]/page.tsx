import connectDB from "@/config/database";
import makeSerializable from "@/utils/convertToObj";
import Type from "@/models/Type";
import ProductsSection from "@/components/customerUI/productsPageContent/ProductsSection";
import { loadSearchParams } from "@/lib/searchParams";
import { getCachedBrands } from "@/utils/getCachedLists";
import { getProducts } from "@/actions/productsActions";
import { SearchParams } from "nuqs";
import { revalidateTag } from "next/cache";
type PageProps = {
  searchParams: Promise<SearchParams>;
  params: { type: string };
};
const ProductsPage = async ({ params, searchParams }: PageProps) => {
  try {
    await connectDB();

    const [typeDoc, filters, brands] = await Promise.all([Type.findOne({ slug: params.type }), loadSearchParams(searchParams), getCachedBrands()]);
    const typeId = typeDoc._id.toString();

    const { productsDoc, sizes, pagination } = await getProducts(filters, { brands, typeId });

    async function refetchProducts() {
      "use server";
      revalidateTag("products");
    }

    const products = makeSerializable(productsDoc);
    const brandsName = brands.map((brand) => brand.name);

    return <ProductsSection refetchProducts={refetchProducts} products={products} sizes={sizes} brands={brandsName} pagination={pagination} />;
  } catch (error) {
    console.error("Failed to fetch products page data:", error);
    // Return a user-friendly error UI instead of crashing the page
    throw new Error("Could not load products, please try again.");
  }
};

export default ProductsPage;
