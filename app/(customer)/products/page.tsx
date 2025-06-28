import connectDB from "@/config/database";
import Product from "@/models/Product";
import makeSerializable from "@/utils/convertToObj";
import ProductsSection from "@/components/customerUI/productsPageContent/ProductsSection";
import { getCachedBrands, getCachedSizes, getCachedTypes } from "@/utils/getCachedLists";
// import convertToSerializableObject from "@/utils/convertToObj";

const ProductsPage = async () => {
  await connectDB();
  const currentDate = new Date();
  const productsDoc = await Product.find({})
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

  const brands = (await getCachedBrands()) as [{ _id: string; name: string }];
  const types = (await getCachedTypes()) as [{ _id: string; name: string }];
  const sizes = await getCachedSizes();
  const sizesValue = sizes.map((size) => size.value);
  const brandsName = brands.map((brand) => brand.name);
  const typesName = types.map((type) => type.name);

  // const salesDoc = await Sale.find({}).lean();
  // const sales = makeSerializable(salesDoc) as SaleType[];
  // console.log("sales: ", sales);
  return <ProductsSection products={products} sizes={sizesValue} types={typesName} brands={brandsName} />;
};

export default ProductsPage;
