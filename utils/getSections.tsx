import Category from "@/models/Category";
import makeSerializable from "./convertToObj";
import { getCachedCategories } from "./getCachedLists";

// Function to manage categories by their respective sections
export default async function getSections() {
  // Predefined sections with initial categories
  const sections = [
    { section: "Helmets", categories: [] },
    { section: "Riding Style", categories: [{ name: "Adventure" }, { name: "Racing" }, { name: "Touring" }, { name: "Urban" }, { name: "Enduro" }] },
    { section: "Riding Gear", categories: [] },
    { section: "Motorcycle Parts", categories: [] },
    { section: "Motorcycles", categories: [] },
  ];

  // Fetch categories from the cache
  const categories = await getCachedCategories();

  // Create a map for quick access to categories by section
  const sectionMap = new Map();
  sections.forEach((s) => {
    sectionMap.set(s.section, s.categories);
  });

  // Check if categories were retrieved successfully
  if (categories && Array.isArray(categories)) {
    for (const category of categories) {
      // Get the target category array for the current category's section
      const targetCategoriesArray = sectionMap.get(category.section);

      // If the section exists, add the category to it
      if (targetCategoriesArray) {
        targetCategoriesArray.push(category);
      } else {
        // Warn if the category's section is not predefined
        console.warn(`Category "${category.name}" has section "${category.section}" which is not predefined.`);
      }
    }
  } else {
    // Warn if no valid categories were found
    console.warn("No categories found or an invalid format was returned from getCachedCategories.");
  }
  const ridingGearSection = sections.find((section) => section.section === "Riding Gear");
  const helmetsCategory = ridingGearSection?.categories?.find((category) => category.name === "Helmets");
  const helmetsApplicableTypes = helmetsCategory?.applicableTypes;

  sections.at(0)?.categories.push(...helmetsApplicableTypes)

  // Log the final sections structure
  console.log("sections: ", sections);
  return sections; // Return the sections with their respective categories
}
