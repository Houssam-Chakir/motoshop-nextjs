import connectDB from "@/config/database";
import makeSerializable from "@/utils/convertToObj";
import ProductsSection from "@/components/customerUI/productsPageContent/ProductsSection";
import { getCachedBrands, getCachedSizes, getCachedTypes } from "@/utils/getCachedLists";
import { getProducts } from "@/actions/productsActions";
import { parseAsString, SearchParams } from "nuqs/server";
import { loadSearchParams } from "@/lib/searchParams";

// import convertToSerializableObject from "@/utils/convertToObj";

// It's good practice to define the shape of your data
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
};

const ProductsPage = async ({ searchParams }: PageProps) => {
  try {
    await connectDB();
    const filters = await loadSearchParams(searchParams);
    const [brands, types, sizes] = await Promise.all([getCachedBrands() as Promise<Brand[]>, getCachedTypes() as Promise<ProductType[]>, getCachedSizes() as Promise<Size[]>]);

    const productsDoc = await getProducts(filters, brands, types, sizes);
    const products = makeSerializable(productsDoc);

    const sizesValue = sizes.map((size) => size.value);
    const brandsName = brands.map((brand) => brand.name);
    const typesName = types.map((type) => type.name);

    return <ProductsSection products={products} sizes={sizesValue} types={typesName} brands={brandsName} />;
  } catch (error) {
    console.error("Failed to fetch products page data:", error);
    // Return a user-friendly error UI instead of crashing the page
    throw new Error("Could not load products, please try again.");
  }
};

export default ProductsPage;
