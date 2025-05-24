import { useState } from "react";
import CategoryButton from "./CategoryButton";
import Container from "@/components/layout/Container";
import CategoryMenu from "./CategoryMenu";

const CategoriesSection = ({ sections, whichSectionMenuOpen, setWhichSectionMenuOpen }) => {
  const categories = ["Riding Gear", "Motorcycle Parts", "Motorcycles", "SALES!"];

  return (
    <>
      {categories &&
        sections.map((section, i) => {
          return (
            <div key={i} className=''>
              <CategoryButton inFocus={whichSectionMenuOpen === i ? true : false} onClick={() => setWhichSectionMenuOpen((prev) => (prev === i ? null : i))} section={section} />
              {/* Category Menu */}
              {whichSectionMenuOpen === i && <CategoryMenu onMouseLeave={() => setWhichSectionMenuOpen(null)} section={section} />}
            </div>
          );
        })}
    </>
  );
};

export default CategoriesSection;
