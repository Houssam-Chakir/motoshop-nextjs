import ProductAddForm from "@/components/forms/ProductAddForm";
import { getCachedBrands, getCachedCategories, getCachedSizes, getCachedTypes } from "@/utils/getCachedLists";
import { getSessionUser } from "@/utils/getSessionUser";

const AddProduct = async () => {
  await getSessionUser();

  const [brands, types, categories, sizes] = await Promise.all([getCachedBrands(), getCachedTypes(), getCachedCategories(), getCachedSizes()]);

  return (
    <section className='flex justify-center bg-slate-100'>
      <div className='px-12 py-6 border my-6 rounded-xs bg-white'>
        <h1 className='font-display text-3xl pb-4 mb-8 text-center border-b'>Create new product</h1>
        <ProductAddForm brands={brands as [{ _id: string; name: string }]} types={types as [{ _id: string; name: string }]} categories={categories} sizes={sizes} />
      </div>
    </section>
  );
};

export default AddProduct;
