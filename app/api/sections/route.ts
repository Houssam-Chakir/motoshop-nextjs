// app/api/sections/route.ts
import { NextResponse } from 'next/server';
import { getCachedCategories } from "@/utils/getCachedLists";
import { Category } from "@/types/section";

export async function GET() {
  try {
    // Your existing getSections logic moved here (server-side only)
    const sections: { section: string; categories: Category[] }[] = [
      { section: "Helmets", categories: [] },
      {
        section: "Riding Style",
        categories: ["Adventure", "Racing", "Touring", "Urban", "Enduro"].map((name) => ({
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          section: "Riding Style",
          icon: { secure_url: "", public_id: "" },
        })),
      },
      { section: "Riding Gear", categories: [] },
      { section: "Motorcycle Parts", categories: [] },
      { section: "Motorcycles", categories: [] },
    ];

    // Fetch categories from the cache (runs server-side)
    const categories: Category[] = await getCachedCategories();

    // Create a map for quick access to categories by section
    const sectionMap = new Map();
    sections.forEach((s) => {
      sectionMap.set(s.section, s.categories);
    });

    // Check if categories were retrieved successfully
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

    const ridingGearSection = sections.find((section) => section.section === "Riding Gear");
    const helmetsCategory = ridingGearSection?.categories?.find((category) => category.name === "Helmets");
    const helmetsApplicableTypes = helmetsCategory?.applicableTypes ?? [];

    sections.at(0)?.categories.push(...(helmetsApplicableTypes as Category[]));

    // Map to match the Section interface
    const finalSections = sections.map((s) => ({
      ...s,
      name: s.section,
      slug: s.section.toLowerCase().replace(/\s+/g, "-"),
    }));

    return NextResponse.json(finalSections);
  } catch (error) {
    console.error('Failed to fetch sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}
