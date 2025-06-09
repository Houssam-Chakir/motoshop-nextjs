import { Section } from "@/types/section";
import { ChevronDown } from "lucide-react";

interface CategoryButtonProps {
  section: Section;
  inFocus: boolean;
  onClick: () => void;
}

const CategoryButton = ({ section, inFocus, onClick }: CategoryButtonProps) => {
  return (
    <>
      <button onClick={onClick} className={`flex items-center group h-[52px] px-4 ${inFocus ? "bg-primary" : ""} hover:bg-primary`}>
        <span className={`text-sm ${inFocus ? "text-white" : ""} group-hover:text-white`}>{section.section}</span>
        <span className=''>
          <ChevronDown className={`h-4 ${inFocus ? "text-white rotate-180 " : ""} group-hover:text-white duration-100`} />
        </span>
      </button>
    </>
  );
};

// whats inside the drop down

export default CategoryButton;
