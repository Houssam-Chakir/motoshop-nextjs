import ProductCard from "@/components/Card";
import connectDB from "@/config/database";
import Product, { ProductType } from "@/models/Product";
import makeSerializable from "@/utils/convertToObj";
// import convertToSerializableObject from "@/utils/convertToObj";

const ProductsPage = async () => {
  await connectDB();
  const productsDoc = await Product.find({}).lean();
  const products = makeSerializable(productsDoc) as ProductType[];
  console.log("products: ", products);
  return (
    <>
      <div className='text-2xl'>Products page</div>
      <div className="flex flex-wrap gap-4">
        {products.map((product) => {
          return <ProductCard product={product} key={product.sku} />;
        })}
      </div>
    </>
  );
};

export default ProductsPage;
