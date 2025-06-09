/* eslint-disable @next/next/no-img-element */
import Container from "@/components/layout/Container";
import Link from "next/link";
import { Section, Category, Type } from "@/types/section";

interface CategoryMenuProps {
  section: Section;
  onMouseLeave: () => void;
}

const CategoryMenu = ({ section, onMouseLeave }: CategoryMenuProps) => {
  return (
    <div onMouseLeave={onMouseLeave} className='absolute bg-white w-full left-0 pb-12 border-t-4 border-primary'>
      <div className='w-fill py-6 font-bold'>
        <Container>
          <h1>{section.section.toUpperCase()}:</h1>
        </Container>
      </div>
      <Container className=' justify-center'>
        <SectionMenu section={section} />
      </Container>
    </div>
  );
};

// whats inside the drop down
function SectionMenu({ section }: { section: Section }) {
  return (
    <div className='flex gap'>
      {section.categories.map((category: Category, i: number) => {
        return <CategoryBlock key={i} category={category} />;
      })}
    </div>
  );
}

// blocks of categories
function CategoryBlock({ category }: { category: Category }) {
  return (
    <div className='flex gap-6 py-6 pl-6 pr-12'>
      <div className=''>
        <img className='h-12' src='/racing-helmet.svg' alt='racing' />
      </div>
      <div className='flex gap-1 flex-col'>
        <Link href={"#"} className={`hover:text-primary-dark  font-medium text-[20px] text-primary-dark pb-1 ${!category.applicableTypes ? "pt-2" : ""}`}>
          {category.name}
        </Link>
        {category.applicableTypes &&
          category.applicableTypes.map((type: Type, i: number) => {
            return (
              <Link href={"#"} key={i} className='relative text-sm text-slate-700 font-light hover:text-slate-950 hover:underline duration-100'>
                {type.name}
              </Link>
            );
          })}
      </div>
    </div>
  );
}

export default CategoryMenu;
