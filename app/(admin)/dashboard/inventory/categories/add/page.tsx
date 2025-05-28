
import CategoryAddForm from "@/components/forms/CategoryAddForm";
import { getSessionUser } from "@/utils/getSessionUser";


const AddProduct = async () => {
  await getSessionUser();

  return (
    <section className='flex justify-center bg-slate-100'>
      
        <CategoryAddForm />
    </section>
  );
};

export default AddProduct;
