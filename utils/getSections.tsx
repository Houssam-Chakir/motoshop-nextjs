import Category from "@/models/Category";
import makeSerializable from "./convertToObj";
import { getCachedCategories } from "./getCachedLists";

//f/ Handle Categories by section
export default async function getSections() {
  const sections = [
    { section: "Riding Gear", categories: [] },
    { section: "Motorcycle Parts", categories: [] },
    { section: "Motorcycles", categories: [] },
  ];

  const categories = await getCachedCategories();


  const sectionMap = new Map();
  sections.forEach((s) => {
    sectionMap.set(s.section, s.categories);
  });

  if (categories && Array.isArray(categories)) {
    for (const category of categories) {
      const targetCategoriesArray = sectionMap.get(category.section);

      if (targetCategoriesArray) {
        targetCategoriesArray.push(category);
      } else {
        console.warn(`Category "${category.name}" has section "${category.section}" which is not predefined.`);
      }
    }
  } else {
    console.warn("No categories found or an invalid format was returned from getCachedCategories.");
  }

  console.log("sections: ", sections);
  return sections;
}
