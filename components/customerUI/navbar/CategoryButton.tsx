import Container from "@/components/layout/Container";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const CategoryButton = ({ section, inFocus, onClick }: { section: string; inFocus: boolean; onClick: () => void }) => {

  return (
    <>
      <button onClick={onClick} className={`flex items-center group h-[52px] px-4 ${inFocus ? ('bg-primary'):('')} hover:bg-primary`}>
        <span className={`text-sm ${inFocus ? ('text-white'):('')} group-hover:text-white`}>{section.section}</span>
        <span className=''>
          <ChevronDown className={`h-4 ${inFocus ? ('text-white rotate-180 '):('')} group-hover:text-white duration-100`} />
        </span>
      </button>
    </>
  );
};

// whats inside the drop down
function SectionMenu({ section }) {
  return (
    <div className='flex gap'>
      {section.categories.map((category, i) => {
        return <CategoryBlock key={i} category={category} />;
      })}
    </div>
  );
}

// blocks of categories
function CategoryBlock({ category }) {
  return (
    <div className='flex gap-4 py-6 pl-6 pr-12'>
      <div className=''>
        <img className='h-12' src='/racing-helmet.svg' alt='racing' />
      </div>
      <div className='flex flex-col'>
        <h1 className='font-display font-medium text-[16px] text-primary-dark pb-1'>{category.name}</h1>
        {category.applicableTypes.map((type, i) => {
          return (
            <div key={i} className='text-sm font-light'>
              {type.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryButton;
