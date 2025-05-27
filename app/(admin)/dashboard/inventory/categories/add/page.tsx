
import CategoryAddForm from "@/components/forms/CategoryAddForm";
import { getSessionUser } from "@/utils/getSessionUser";


const AddProduct = async () => {
  await getSessionUser();

  return (
    <section className='flex justify-center bg-slate-100'>
      <div className='px-12 py-6 border my-6 rounded-xs bg-white'>
        <h1 className='font-display text-3xl pb-4 mb-8 text-center border-b'>Create new product</h1>
        <CategoryAddForm />
      </div>
    </section>
  );
};

export default AddProduct;
