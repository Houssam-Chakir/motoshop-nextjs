import { useState } from "react";
import CategoryButton from "./CategoryButton";
import Container from "@/components/layout/Container";
import CategoryMenu from "./CategoryMenu";

const CategoriesSection = ({ sections }) => {
  const categories = ["Riding Gear", "Motorcycle Parts", "Motorcycles", "SALES!"];
  const [whichMenuOpen, setWhichMenuOpen] = useState(null);

  return (
    <>
      {categories &&
        sections.map((section, i) => {
          return (
            <div key={i} className=''>
              <CategoryButton inFocus={whichMenuOpen === i ? true : false} onClick={() => setWhichMenuOpen((prev) => (prev === i ? null : i))} section={section} />
              {/* Category Menu */}
              {whichMenuOpen === i && <CategoryMenu onMouseLeave={() => setWhichMenuOpen(null)} section={section} />}
            </div>
          );
        })}
    </>
  );
};

export default CategoriesSection;
