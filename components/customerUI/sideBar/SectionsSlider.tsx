"use client"

import * as React from "react"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CategoryType {
  id: string
  name: string
  description?: string
  icon?: React.ReactNode
  count?: number
}

interface Category {
  id: string
  name: string
  icon?: React.ReactNode
  types: CategoryType[]
}

interface CategoriesSliderProps {
  categories: Category[]
  onCategorySelect?: (category: Category) => void
  onTypeSelect?: (type: CategoryType, category: Category) => void
}

export function CategoriesSlider({ categories, onCategorySelect, onTypeSelect }: CategoriesSliderProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null)

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category)
    onCategorySelect?.(category)
  }

  const handleBackClick = () => {
    setSelectedCategory(null)
  }

  const handleTypeClick = (type: CategoryType) => {
    if (selectedCategory) {
      onTypeSelect?.(type, selectedCategory)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background sticky top-0 z-10">
        {selectedCategory && (
          <Button variant="ghost" size="sm" onClick={handleBackClick} className="p-1 h-8 w-8 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h2 className="text-lg font-semibold truncate">
          {selectedCategory ? selectedCategory.name : "Shop by Category"}
        </h2>
      </div>

      {/* Content Container */}
      <div className="flex-1 relative overflow-hidden">
        {/* Main Categories View */}
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-300 ease-out bg-background",
            selectedCategory ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100",
          )}
        >
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <div className="text-sm text-muted-foreground mb-4">Browse all categories</div>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-left group hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {category.icon && (
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        {category.icon}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-base">{category.name}</div>
                      <div className="text-sm text-muted-foreground">{category.types.length} subcategories</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Subcategories View */}
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-300 ease-out bg-background",
            selectedCategory ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
          )}
        >
          {selectedCategory && (
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                <div className="text-sm text-muted-foreground mb-4">
                  Choose from {selectedCategory.name.toLowerCase()}
                </div>
                {selectedCategory.types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeClick(type)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-left group hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      {type.icon && (
                        <div className="p-3 rounded-lg bg-secondary/50 text-secondary-foreground group-hover:bg-secondary transition-colors">
                          {type.icon}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-base">{type.name}</div>
                        {type.description && <div className="text-sm text-muted-foreground">{type.description}</div>}
                      </div>
                    </div>
                    {type.count && (
                      <div className="text-sm text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md">
                        {type.count}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  )
}
