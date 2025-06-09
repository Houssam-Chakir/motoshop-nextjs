import Link from "next/link";
import ProductCard from "@/components/Card";
import connectDB from "@/config/database";
import Product, { ProductType } from "@/models/Product";
import makeSerializable from "@/utils/convertToObj";
import Category from "@/models/Category";
import { Button } from "@/components/ui/button";
import { Pen } from "lucide-react";

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
  section: string;
  icon: {
    secure_url: string;
    public_id: string;
  };
}

const InventoryPage = async () => {
  await connectDB();
  const productsDoc = await Product.find({}).lean();
  const products = makeSerializable(productsDoc) as ProductType[];
  const categoriesDoc = await Category.find({}).lean();
  const categories = makeSerializable(categoriesDoc) as CategoryType[];
  console.log("products: ", products);
  return (
    <div>
      <h1>Inventory</h1>
      <div className='flex flex-col'>
        <Link href={"inventory/product/add"}>Add product</Link>
        <Link href={"inventory/categories/add"}>Add Category</Link>
      </div>

      <div className='text-2xl'>Products</div>
      <div className='flex flex-wrap gap-4'>
        {products.map((product) => {
          return <ProductCard product={product} key={product.sku} />;
        })}
      </div>
      <div>Categories</div>
      <div className='flex gap-4 flex-wrap'>
        {categories.map((category: CategoryType, i: number) => {
          return (
            <div key={i} className='p-4 border bg-white w-fit flex gap-2 items-center'>
              <h3>{category.name}</h3>
              <Link href={`/dashboard/inventory/categories/edit/${category._id}`}>
                <Button variant='ghost'><Pen/></Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryPage;
