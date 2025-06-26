/* eslint-disable @next/next/no-img-element */
import Container from "@/components/layout/Container";
import Link from "next/link";
import { Section, Category, Type } from "@/types/section";
import { useRouter } from "next/navigation";

interface CategoryMenuProps {
  section: Section;
  onMouseLeave: () => void;
  ridingStyleSection: Section;
}

const RidingStyleButton = ({ category }: { category: Category }) => {
  return (
    <div className='w-fit flex items-center gap-1 p-4 text-sm font-light text-gray-800 cursor-pointer hover:text-primary-dark' key={category.name}>
      <img width={24} src={"/" + category.name.toLowerCase().replace(" ", "-") + ".svg"} alt={category.name.toLowerCase()} />
      <div>{category.name}</div>
    </div>
  );
};

const SectionDropDown = ({ section, onMouseLeave, ridingStyleSection }: CategoryMenuProps) => {
  return (
    <div onMouseLeave={onMouseLeave} className='absolute w-full left-0 bg-white border-t-4 border-primary shadow-xl pt-12'>
      <Container className=' justify-center pb-12'>
        <SectionMenu section={section} isHelmetsSection={section.section === "Helmets"} />
      </Container>
      {section.section !== "Helmets" && (
        <div className='bg-grey-light'>
          <Container className='flex gap-3 justify-end'>
            <p className='flex items-center gap-1 p-4 text-sm font-light text-gray-800 cursor-default'>Riding Styles:</p>
            {ridingStyleSection &&
              ridingStyleSection.categories.map((category: Category, i: number) => {
                return <RidingStyleButton key={i} category={category} />;
              })}
          </Container>
        </div>
      )}
    </div>
  );
};

// whats inside the drop down
function SectionMenu({ section, isHelmetsSection }: { section: Section; isHelmetsSection: boolean }) {
  console.log("is helmet section", isHelmetsSection);
  return (
    <div className='flex justify-center'>
      <div className='flex justify-around'>
        {!isHelmetsSection &&
          section.categories.map((category: Category, i: number) => {
            return <CategoryBlock key={i} category={category} />;
          })}
        {isHelmetsSection &&
          section.categories.map((category: Category, i: number) => {
            return <HelmetBlock key={i} category={category} />;
          })}
      </div>
    </div>
  );
}

// blocks of categories
function CategoryBlock({ category }: { category: Category }) {
  const router = useRouter();
  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to product page

    console.log("category", category);
    router.push(`/products/${category.slug}`);
  };
  const handleTypeClick = (e: React.MouseEvent, typeSlug: string) => {
    e.stopPropagation();
    // Navigate to product page

    router.push(`/products/${category.slug}/${typeSlug}`);
  };

  return (
    <div onClick={handleCategoryClick} className='flex gap-6 py-6 pl-6 pr-12'>
      <div className=''>
        <img className='h-12' src={category.icon?.secure_url ? category.icon?.secure_url : "/full-face-helmet.svg"} alt='racing' />
      </div>
      <div className='flex gap-1 flex-col'>
        <p className={`hover:text-primary-dark cursor-pointer  font-medium text-[18px] text-black pb-1 ${!category.applicableTypes ? "pt-2" : ""}`}>{category.name}</p>
        {category.applicableTypes &&
          category.applicableTypes.map((type: Type, i: number) => {
            return (
              <p
                onClick={(e) => handleTypeClick(e, type.slug)}
                key={i}
                className='cursor-pointer relative text-sm text-slate-700 font-light hover:text-slate-950 hover:underline duration-100'
              >
                {type.name}
              </p>
            );
          })}
      </div>
    </div>
  );
}
// blocks of helmets
function HelmetBlock({ category }: { category: Category }) {
  const router = useRouter();

  const handleTypeClick = (e: React.MouseEvent, typeSlug: string) => {
    e.stopPropagation();
    // Navigate to product page

    router.push(`/products/helmets/${typeSlug}`);
  };
  return (
    <button onClick={(e) => handleTypeClick(e, category.slug)} className='flex flex-col gap-2 py-6 px-8 justify-center items-center group hover:cursor-pointer'>
      <div className=''>
        <img className='h-16' src={"/" + category.name.toLowerCase().replace(" ", "-") + ".svg"} alt={category.name.toLowerCase()} />
      </div>
      <div className='flex gap-1 flex-col'>
        <Link href={"#"} className={`group-hover:text-primary-dark font-light text-[14px] text-black pb-1 ${!category.applicableTypes ? "pt-2" : ""}`}>
          {category.name}
        </Link>
      </div>
    </button>
  );
}

export default SectionDropDown;
