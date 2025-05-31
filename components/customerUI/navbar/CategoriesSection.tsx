import CategoryButton from "./CategoryButton";
import CategoryMenu from "./CategoryMenu";
import { Section } from "@/types/section";

interface CategoriesSectionProps {
  sections: Section[];
  whichSectionMenuOpen: number | null;
  setWhichSectionMenuOpen: (value: number | null) => void;
}

const CategoriesSection = ({ sections, whichSectionMenuOpen, setWhichSectionMenuOpen }: CategoriesSectionProps) => {
  return (
    <>
      {sections &&
        sections.map((section: Section, i: number) => {
          return (
            <div key={i} className=''>
              <CategoryButton
                inFocus={whichSectionMenuOpen === i ? true : false}
                onClick={() => setWhichSectionMenuOpen(whichSectionMenuOpen === i ? null : i)}
                section={section}
              />
              {/* Category Menu */}
              {whichSectionMenuOpen === i && <CategoryMenu onMouseLeave={() => setWhichSectionMenuOpen(null)} section={section} />}
            </div>
          );
        })}
    </>
  );
};

export default CategoriesSection;
