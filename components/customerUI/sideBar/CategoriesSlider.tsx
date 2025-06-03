/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SheetClose } from "@/components/ui/sheet";
import { Section } from "@/types/section";

// --- Type Definitions ---

interface SubCategory {
  name: string;
  // id?: string; // Consider adding unique IDs if available
  // href?: string; // For dynamic navigation
}

interface SectionSchema {
  id?: string; // Consider adding unique IDs if available
  section?: string; // The display name of the section, e.g., "Helmets"
  name?: string; // Alternative name or identifier, clarify its usage if different from section
  categories?: SubCategory[];
  iconSlug?: string; // e.g., "riding-gear" to derive /riding-gear.svg
}

// --- Helper Function ---
const generateSlug = (name?: string): string => {
  if (!name || typeof name !== "string") return "default-icon"; // Fallback slug
  return name.trim().toLowerCase().replace(/\s+/g, "-");
};

// --- Main Component ---
export interface CategoriesSliderProps {
  sections: Section[];
  onCategorySelect: (section: Section) => void;
  onTypeSelect: (type: { name: string }, section: Section) => void;
}

export function CategoriesSlider({ sections }: CategoriesSliderProps) {
  const [selectedSection, setSelectedSection] = React.useState<SectionSchema | null>(null);

  const { mainSections, ridingStyleSection } = React.useMemo(() => {
    const rsSection = sections.find((s) => s.section === "Riding Style");
    const mSections = sections.filter((s) => s.section !== "Riding Style");
    return { mainSections: mSections, ridingStyleSection: rsSection };
  }, [sections]);

  const handleSectionClick = (section: SectionSchema) => {
    setSelectedSection(section);
  };

  const handleBackClick = () => {
    setSelectedSection(null);
  };

  const currentTitle = selectedSection?.section || selectedSection?.name || "Explore Sections";

  return (
    <div className='h-full flex flex-col bg-background'>
      {/* Header */}
      <div className='flex items-center gap-2 p-3 sm:p-4 border-b bg-background sticky top-0 z-10'>
        {selectedSection && (
          <Button variant='ghost' size='icon' onClick={handleBackClick} className='p-1 h-8 w-8 rounded-none shrink-0'>
            <ArrowLeft className='h-5 w-5' />
          </Button>
        )}
        <h2 className='text-lg font-semibold truncate flex-1'>{currentTitle}</h2>
        <SheetClose asChild>
          <Button variant='ghost' size='icon' className='p-1 h-8 w-8 shrink-0 rounded-none'>
            <X className='h-5 w-5' />
          </Button>
        </SheetClose>
      </div>

      {/* Content Container */}
      <div className='flex-1 relative overflow-hidden'>
        {/* Main Sections View */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-300 ease-out bg-background", // Added 'transition-all' for opacity too
            selectedSection ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
          )}
        >
          {/* Only render ScrollArea if not selectedSection, to prevent rendering hidden content unnecessarily */}
          {!selectedSection && (
            <ScrollArea className='h-full'>
              <div className='p-4 space-y-6'>
                {mainSections.length > 0 && (
                  <div>
                    <h3 className='text-sm font-medium text-muted-foreground mb-3 px-1'>Main Sections:</h3>
                    <div className='grid grid-cols-2 gap-3'>
                      {mainSections.map((section) => (
                        <SidebarSectionButton key={section.id || section.section} section={section} onClick={() => handleSectionClick(section)} />
                      ))}
                    </div>
                  </div>
                )}
                {ridingStyleSection?.categories && ridingStyleSection.categories.length > 0 && (
                  <div>
                    <h3 className='text-sm font-medium text-muted-foreground mb-3 px-1'>{ridingStyleSection.section}:</h3>
                    <div className='grid grid-cols-2 gap-3'>
                      {ridingStyleSection.categories.map((category) => (
                        <SidebarLinkButton
                          key={category.name}
                          item={category}
                          // Assuming Riding Style items navigate and close.
                          // onClick prop here could be used if specific logic is needed before closing.
                          // e.g., onClick={() => console.log("Riding style selected:", category.name)}
                          href={`/products?style=${generateSlug(category.name)}`} // Example dynamic href
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Categories (Sub-categories) View */}
        <div
          className={cn(
            "absolute inset-0 transition-all duration-300 ease-out bg-background", // Added 'transition-all'
            selectedSection?.categories?.length ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
          )}
        >
          {/* Only render if a section with categories is selected */}
          {selectedSection?.categories && selectedSection.categories.length > 0 && (
            <ScrollArea className='h-full'>
              <div className='p-4 space-y-2'>
                <h3 className='text-sm font-medium text-muted-foreground mb-3 px-1'>
                  Choose from {selectedSection.section?.toLowerCase() || selectedSection.name?.toLowerCase()}:
                </h3>
                {selectedSection.categories.map((category) => (
                  <SidebarLinkButton
                    key={category.name}
                    item={category}
                    // onClick will be handled by SheetClose if not passed explicitly for other logic
                    // If handleBackClick is desired to reset view *before* navigation/close:
                    // onClick={handleBackClick}
                    href={`/products?section=${generateSlug(selectedSection.section || selectedSection.name)}&type=${generateSlug(category.name)}`} // Example dynamic href
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-Components ---

interface SidebarSectionButtonProps {
  section: SectionSchema;
  onClick: () => void;
}

function SidebarSectionButton({ section, onClick }: SidebarSectionButtonProps) {
  const slug = generateSlug(section.iconSlug || section.section || section.name);
  const displayName = section.section || section.name || "Unnamed Section";

  return (
    <button
      onClick={onClick}
      type='button'
      className='w-full flex flex-col items-center justify-center p-3 aspect-square rounded-none ring-1 ring-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors duration-200 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
    >
      <img
        className='h-12 w-12 sm:h-14 sm:w-14 object-contain mb-2' // Adjusted size
        src={`/${slug}.svg`}
        alt={displayName} // More meaningful alt
      />
      <h4 className='text-xs text-center font-medium text-primary'>{displayName}</h4> {/* Changed to h4 */}
    </button>
  );
}

interface SidebarLinkButtonProps {
  item: SubCategory;
  onClick?: () => void; // Optional: For any logic before closing/navigation
  href: string; // Make href required for a link button
}

function SidebarLinkButton({ item, onClick, href }: SidebarLinkButtonProps) {
  const slug = generateSlug(item.name); // Assuming icon uses item name
  const displayName = item.name || "Unnamed Link";

  return (
    <SheetClose asChild>
      <Link
        href={href}
        onClick={onClick} // Will execute before SheetClose closes the sheet
        className='w-full flex flex-col items-center justify-center p-3 aspect-square ring-1 ring-border bg-card hover:bg-accent hover:text-accent-foreground transition-colors duration-200 text-left group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      >
        <img
          className='h-12 w-12 sm:h-14 sm:w-14 object-contain mb-2' // Adjusted size
          src={`/${slug}.svg`}
          alt={displayName}
        />
        <h4 className='text-xs text-center font-medium text-primary'>{displayName}</h4> {/* Changed to h4 */}
      </Link>
    </SheetClose>
  );
}
