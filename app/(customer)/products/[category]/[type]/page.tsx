import connectDB from "@/config/database";
import Product from "@/models/Product";
import makeSerializable from "@/utils/convertToObj";
import Type from "@/models/Type";
import ProductsSection from "@/components/customerUI/productsPageContent/ProductsSection";
// import convertToSerializableObject from "@/utils/convertToObj";

const ProductsPage = async ({ params }: { params: { category: string; type: string } }) => {
  await connectDB();
  const currentDate = new Date();

  const { type } = params;
  const typeDoc = await Type.findOne({ slug: type });
  const typeId = typeDoc._id.toString();

  const productsDoc = await Product.find({ type: typeId })
    .populate({
      path: "saleInfo",
      match: { isActive: true, startDate: { $lte: currentDate }, endDate: { $gte: currentDate } },
      select: "name discountType discountValue startDate endDate isActive",
    })
    .populate({
      path: "stock",
      select: "sizes",
    })
    .lean({ virtuals: true });
  const products = makeSerializable(productsDoc);
  console.log("products: ", products);

  // const salesDoc = await Sale.find({}).lean();
  // const sales = makeSerializable(salesDoc) as SaleType[];
  // console.log("sales: ", sales);
  return <ProductsSection products={products} />;
};

export default ProductsPage;
