import Link from "next/link";
import ProductCard from "@/components/Card";
import connectDB from "@/config/database";
import Product, { ProductType } from "@/models/Product";
import makeSerializable from "@/utils/convertToObj";

const InventoryPage = async () => {
  await connectDB();
  const productsDoc = await Product.find({}).lean();
  const products = makeSerializable(productsDoc) as ProductType[];
  console.log("products: ", products);
  return (
    <div>
      <h1>Inventory</h1>
      <Link href={"inventory/product/add"}>Add product</Link>
      <div className='text-2xl'>Products</div>
      <div className='flex flex-wrap gap-4'>
        {products.map((product) => {
          return <ProductCard product={product} key={product.sku} />;
        })}
      </div>
    </div>
  );
};

export default InventoryPage;
