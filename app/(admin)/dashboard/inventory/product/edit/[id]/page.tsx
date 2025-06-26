import connectDB from "@/config/database";
import Product, { ProductType } from "@/models/Product";
import makeSerializable from "@/utils/convertToObj";
import { getSessionUser } from "@/utils/getSessionUser";

import ProductEditForm from "@/components/forms/ProductEditForm";
import { getCachedBrands, getCachedCategories, getCachedSizes, getCachedTypes } from "@/utils/getCachedLists";
import Stock, { StockDocument } from "@/models/Stock";

const ProductEditPage = async ({ params }: { params: { id: string } }) => {
  // Connect to DB and get user session
  await connectDB();
  await getSessionUser();
  // Get product to be edited
  const { id } = await params;
  const productDoc = await Product.findById(id).lean();
  const product = makeSerializable(productDoc) as ProductType & { _id: string };
  // Get stock document using product id
  const stockDoc = await Stock.findOne({ productId: id }).lean() as StockDocument | null;
  const stock = makeSerializable(stockDoc)
  console.log('stock: ', stock);




  const brands = (await getCachedBrands()) as [{ _id: string; name: string }];
  const types = (await getCachedTypes()) as [{ _id: string; name: string }];
  const categories = (await getCachedCategories()) as [{ _id: string; name: string }];
  const sizes = await getCachedSizes()


  console.log("product: ", product);
  return (
    <section className='flex justify-center bg-slate-100'>
      <div className='px-12 py-6 border my-6 rounded-xs bg-white'>
        <h1 className='font-display text-3xl pb-4 mb-8 text-center border-b'>Edit product</h1>
        <ProductEditForm brands={brands} types={types} categories={categories} editProduct={product} productStock={stock} sizes={sizes} />
      </div>
    </section>
  );
};

export default ProductEditPage;
