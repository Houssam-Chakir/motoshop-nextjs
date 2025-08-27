import CategoryEditForm from "@/components/forms/CategoryEditForm";
import Category from "@/models/Category";
import "@/models/Type"; // Import for Mongoose schema registration
import makeSerializable from "@/utils/convertToObj";
import { getSessionUser } from "@/utils/getSessionUser";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditCategoryPage = async ({ params }: PageProps) => {
  await getSessionUser();
  const { id } = await params;
  console.log("id: ", id);
  const categoryDoc = await Category.findById(id).lean().populate("applicableTypes");
  const category = makeSerializable(categoryDoc);

  console.log("category: ", category);

  return (
    <section className='flex justify-center'>
      <CategoryEditForm category={category} />
    </section>
  );
};

export default EditCategoryPage;
