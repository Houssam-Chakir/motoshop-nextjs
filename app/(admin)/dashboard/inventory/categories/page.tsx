import { getSessionUser } from "@/utils/getSessionUser";
import CategoryAddForm from "@/components/forms/CategoryAddForm";

const CategoriesPage = async () => {
  await getSessionUser();

  return (
    <section className='flex justify-center'>
      <CategoryAddForm />
    </section>
  );
};

export default CategoriesPage;
