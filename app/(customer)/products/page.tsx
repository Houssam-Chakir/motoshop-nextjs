import ProductCardTest from "@/components/Card";
import ProductCard from "@/components/ProductCard";
import connectDB from "@/config/database";
import Product, { ProductType } from "@/models/Product";
import Sale, { SaleType } from "@/models/Sale";
import makeSerializable from "@/utils/convertToObj";
// import convertToSerializableObject from "@/utils/convertToObj";

const ProductsPage = async () => {
  await connectDB();
  const productsDoc = await Product.find({}).lean();
  const products = makeSerializable(productsDoc) as ProductType[];
  console.log("products: ", products);

  const salesDoc = await Sale.find({}).lean();
  const sales = makeSerializable(salesDoc) as SaleType[];
  console.log("sales: ", sales);
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
