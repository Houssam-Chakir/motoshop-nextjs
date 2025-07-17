import { getProduct, getRecentProducts, getSimilarProducts } from "@/actions/productsActions";
import ProductCardsSlider from "@/components/customerUI/ProductCardsSlider";
import ProductDetailsSection from "@/components/customerUI/productDetailsPage/ProductDetailsSection";
import connectDB from "@/config/database";
import { ProductType } from "@/models/Product";
import makeSerializable from "@/utils/convertToObj";
import { notFound } from "next/navigation";

const ProductDetailsPage = async ({ params }: { params: { slug: string } }) => {
  try {
    await connectDB();
    const { slug } = await params;

    const productDoc = await getProduct(slug);

    if (!productDoc) notFound();
    const product = makeSerializable(productDoc);

    const categoryUrlParam = product.category.name.toLowerCase().split(" ").join("-");
    const categoryId = product.category._id;

    const [similarProducts, recentProductsDoc] = await Promise.all([getSimilarProducts(categoryId), getRecentProducts()]);

    const cleanProducts = JSON.parse(JSON.stringify(recentProductsDoc));
    const recentProducts = cleanProducts.map((product: ProductType) => makeSerializable(product));

    return (
      <>
        <ProductDetailsSection product={product} />
        <ProductCardsSlider products={similarProducts} title={"Similar products"} link={`/products/${categoryUrlParam}`} className={"pt-12"} />
        <ProductCardsSlider products={recentProducts} title={"New arrivals"} link={"/products?sort=newest"} className={"pb-24"} />
      </>
    );
  } catch (error) {
    console.error("Failed to fetch products page data:", error);
    throw new Error("Could not load product details, please try again.");
  }
};

export default ProductDetailsPage;
