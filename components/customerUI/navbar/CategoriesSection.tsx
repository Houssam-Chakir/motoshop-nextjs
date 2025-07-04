import SectionButton from "./SectionButton";
import SectionDropDown from "./SectionDropDown";
import { Section } from "@/types/section";

interface CategoriesSectionProps {
  sections: Section[];
  whichSectionMenuOpen: number | null;
  setWhichSectionMenuOpen: (value: number | null) => void;
}

const CategoriesSection = ({ sections, whichSectionMenuOpen, setWhichSectionMenuOpen }: CategoriesSectionProps) => {
  const mainSections = sections.filter((section) => section.section !== "Riding Style");
  const ridingStyleSection = sections.filter((section) => section.section === "Riding Style");

  return (
    <>
      {sections &&
        mainSections.map((section: Section, i: number) => {
          return (
            <div key={i} className=''>
              <SectionButton
                inFocus={whichSectionMenuOpen === i ? true : false}
                onClick={() => setWhichSectionMenuOpen(whichSectionMenuOpen === i ? null : i)}
                section={section}
              />
              {/* Category Menu */}
              {whichSectionMenuOpen === i && <SectionDropDown onMouseLeave={() => setWhichSectionMenuOpen(null)} section={section} ridingStyleSection={ridingStyleSection[0]} />}
            </div>
          );
        })}
    </>
  );
};

export default CategoriesSection;
