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
import { Session } from "next-auth";
import Image from "next/image";
import { useUserContext } from "@/contexts/UserContext";
import GoogleSignupButton from "@/components/authentication/GoogleSignUpButton";
import { signIn } from "next-auth/react";

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
  session: Session | null;
  providers: Record<string, { id: string; name: string }> | null;
  onCategorySelect: (section: Section) => void;
  onTypeSelect: (type: { name: string }, section: Section) => void;
}

export function CategoriesSlider({ sections, session, providers }: CategoriesSliderProps) {
  console.log("session", session);

  const { profile } = useUserContext();
  const userRole = profile?.role as String;

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
      <div className='flex items-center '>
        {selectedSection && (
          <>
            <Button variant='ghost' size='icon' onClick={handleBackClick} className='px-4 py-2 h-8 w-8 rounded-none shrink-0'>
              <ArrowLeft className='h-5 w-5' />
            </Button>
            <h2 className='text-lg p-4 font-semibold truncate flex-1'>{currentTitle}</h2>
          </>
        )}
        {/* <SheetClose asChild>
          <Button variant='ghost' size='icon' className='p-1 h-8 w-8 shrink-0 rounded-none'>
            <X className='h-5 w-5' />
          </Button>
        </SheetClose> */}
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
          {session && (
            <div className='p-4 border-b shrink-0'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-300 bg-gray-100'>
                  <Image
                    src={session.user?.image || "/default-avatar.png"} // Ensure you have a fallback avatar
                    alt={session.user?.name || "User Avatar"}
                    width={48}
                    height={48}
                    className='object-cover w-full h-full'
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/default-avatar.png";
                    }} // Fallback for broken image links
                  />
                </div>
                <div>
                  <p className='font-semibold text-sm truncate'>{session.user?.name || "User Name"}</p>
                  <p className='text-xs text-gray-500 truncate'>{session.user?.email || "user@example.com"}</p>
                  <p className='text-xs text-gray-500 truncate'>{userRole}</p>
                </div>
              </div>
            </div>
          )}
          {!session && (
            <div className='p-4 border-b shrink-0'>
              {providers &&
                Object.values(providers).map((provider) => {
                  if (provider.id === "google") {
                    return (
                      <>
                        <h2 className='text-lg p-3 uppercase text-center pb-3 font-bold shrink-0'>Sign Up</h2>
                        <GoogleSignupButton
                          onSignup={async () => {
                            await signIn(provider.id, { callbackUrl: "/" });
                          }}
                          key={provider.id}
                          className='w-full max-w-xs'
                        />
                      </>
                    );
                  }
                  return null;
                })}
              {!providers && <p className='text-sm text-gray-500'>Sign up options are currently unavailable.</p>}
            </div>
          )}
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
