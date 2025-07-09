import { getProduct } from "@/actions/productsActions";
import ProductDetailsSection from "@/components/customerUI/productDetailsPage/ProductDetailsSection";
import connectDB from "@/config/database";
import makeSerializable from "@/utils/convertToObj";
import { notFound } from "next/navigation";

const ProductDetailsPage = async ({ params }: { params: { slug: string } }) => {
  await connectDB();
  const { slug } = await params;

  const productDoc = await getProduct(slug);

  if (!productDoc) notFound();
  console.log("Product doc: ", productDoc);
  const product = makeSerializable(productDoc);

  return <ProductDetailsSection product={product} />;
};

export default ProductDetailsPage;
