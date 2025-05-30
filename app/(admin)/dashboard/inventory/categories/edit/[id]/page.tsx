import CategoryEditForm from "@/components/forms/CategoryEditForm";
import Category from "@/models/Category";
import makeSerializable from "@/utils/convertToObj";
import { getSessionUser } from "@/utils/getSessionUser";

const EditCategoryPage = async ({params}) => {
  await getSessionUser();
  const {id} = await params
  console.log('id: ', id);
  const categoryDoc = await Category.findById(id).lean().populate('applicableTypes')
  const category = makeSerializable(categoryDoc)

  console.log('category: ', category);


  return (
    <section className='flex justify-cente'>
      <CategoryEditForm category={category} />
    </section>
  );
};

export default EditCategoryPage;
