
import CategoryAddForm from "@/components/forms/CategoryAddForm";
import { getSessionUser } from "@/utils/getSessionUser";


const AddCategoryPage = async () => {
  await getSessionUser();

  return (
    <section className='flex justify-cente'>

        <CategoryAddForm />
    </section>
  );
};

export default AddCategoryPage;
