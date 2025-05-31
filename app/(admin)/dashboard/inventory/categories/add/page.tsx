import CategoryAddForm from "@/components/forms/CategoryAddForm";
import { getSessionUser } from "@/utils/getSessionUser";

const AddCategoryPage = async () => {
  await getSessionUser();

  return (
    <section className='flex justify-center'>
      <CategoryAddForm />
    </section>
  );
};

export default AddCategoryPage;
