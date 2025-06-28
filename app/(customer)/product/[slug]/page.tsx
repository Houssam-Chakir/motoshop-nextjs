import ProductInfo from "@/components/customerUI/ProductInfo";
import connectDB from "@/config/database";
import Product, { ProductDocument, ProductType } from "@/models/Product";
import Stock, { StockDocument, StockType } from "@/models/Stock";
// If SizeQuantityType is a separate export from Stock.ts and needed directly here, ensure it's imported:
// import Stock, { StockDocument, StockType, SizeQuantityType } from "@/models/Stock";
import makeSerializable from "@/utils/convertToObj";
import { notFound } from "next/navigation";

const ProductDetailsPage = async ({ params }: { params: { slug: string } }) => {
  await connectDB();
  const { slug } = params;

  const productDoc = await Product.findOne({ slug }).populate("brand", "name").populate("category", "name").populate("saleInfo").lean<ProductDocument>();

  if (!productDoc) {
    notFound();
  }

  const product = makeSerializable(productDoc);

  let stockData: StockType | null = null;
  if (productDoc._id) {
    const stockDoc = await Stock.findOne({ productId: productDoc._id }).lean<StockDocument>();

    if (stockDoc) {
      stockData = makeSerializable(stockDoc);
    }
  }

  return <ProductInfo product={product} stock={stockData} />;
};

export default ProductDetailsPage;
