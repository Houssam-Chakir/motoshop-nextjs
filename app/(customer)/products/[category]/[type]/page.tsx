import ProductCard from "@/components/ProductCard";
import connectDB from "@/config/database";
import Product, { ProductType } from "@/models/Product";
import makeSerializable from "@/utils/convertToObj";
import Type from "@/models/Type";
// import convertToSerializableObject from "@/utils/convertToObj";

const ProductsPage = async ({ params }: { params: { category: string, type: string } }) => {
  await connectDB();
  const currentDate = new Date();

  const { type } = params;
  const typeDoc = await Type.findOne({slug: type})
  const typeId = typeDoc._id.toString()

  const productsDoc = await Product.find({type: typeId})
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
  const products = makeSerializable(productsDoc) as ProductType[];
  console.log("products: ", products);

  // const salesDoc = await Sale.find({}).lean();
  // const sales = makeSerializable(salesDoc) as SaleType[];
  // console.log("sales: ", sales);
  return (
    <>
      <div className='py-4'>
        <div className='text-[16px]'>Products ({products.length})</div>
      </div>
      <div className='grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-x-2 md:gap-y-16 sm:gap-y-8 gap-y-4'>
        {/* {products.map((product) => {
          return <ProductCardTest product={product} key={product.sku} />;
        })} */}
        {products.map((product) => {
          return <ProductCard product={product} key={product.sku} />;
        })}
      </div>
    </>
  );
};

export default ProductsPage;
