"use client";

import type React from "react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, X, FileImage, CheckCircle } from "lucide-react";
import addNewCategory from "@/app/actions/addCategory";

// Section options
const SECTION_OPTIONS = ["Riding Gear", "Motorcycle Parts", "Motorcycles"] as const;

// Zod Schemas
const TypeSchema = z.object({
  name: z.string().min(1, "Type name is required").max(50, "Type name must be less than 50 characters"),
  slug: z.string().min(1, "Slug is required"),
});

const CategoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Category name must be less than 100 characters"),
  slug: z.string().min(1, "Slug is required"),
  section: z.enum(SECTION_OPTIONS, { required_error: "Section is required" }),
  icon: z
    .instanceof(File, { message: "Icon file is required" })
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB
      "Icon file must be less than 5MB"
    )
    .refine((file) => ["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type), "Icon must be a valid image file (JPEG, PNG, WebP, or SVG)"),
  types: z.array(TypeSchema),
});

export interface SubmissionData {
  name: string;
  slug: string;
  section: string;
  icon: File;
  types: Omit<TypeFormItem, "tempId">[];
}

// Inferred types
type TypeFormData = z.infer<typeof TypeSchema>;
type CategoryFormData = z.infer<typeof CategoryFormSchema>;

// Internal type for form management (includes temporary ID for React keys)
interface TypeFormItem extends TypeFormData {
  tempId: string; // Temporary ID for React key management, not sent to backend
}

interface FormErrors {
  name?: string[];
  icon?: string[];
  section?: string[];
  types?: string[];
  [key: string]: string[] | undefined;
}

export default function CategoryForm() {
  const [formData, setFormData] = useState<
    Omit<CategoryFormData, "icon" | "types" | "section"> & {
      icon: File | null;
      types: TypeFormItem[];
      section: string;
    }
  >({
    name: "",
    slug: "",
    section: "",
    icon: null,
    types: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Validate individual field
  const validateField = (field: keyof CategoryFormData, value: any) => {
    try {
      if (field === "name") {
        CategoryFormSchema.shape.name.parse(value);
      } else if (field === "icon") {
        CategoryFormSchema.shape.icon.parse(value);
      } else if (field === "types") {
        // Convert TypeFormItem[] to TypeFormData[] for validation
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const typesForValidation = value.map(({ tempId, ...type }: TypeFormItem) => type);
        CategoryFormSchema.shape.types.parse(typesForValidation);
      } else if (field === "section") {
        CategoryFormSchema.shape.section.parse(value);
      }

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({
          ...prev,
          [field]: error.errors.map((e) => e.message),
        }));
      }
    }
  };

  // Handle category name change
  const handleNameChange = (name: string) => {
    const newFormData = {
      ...formData,
      name,
      slug: generateSlug(name),
    };
    setFormData(newFormData);
    validateField("name", name);
    setSubmitSuccess(false);
  };

  // Handle section change
  const handleSectionChange = (section: string) => {
    setFormData((prev) => ({
      ...prev,
      section,
    }));
    validateField("section", section);
    setSubmitSuccess(false);
  };

  // Handle icon upload
  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        icon: file,
      }));
      validateField("icon", file);
      setSubmitSuccess(false);
    }
  };

  // Add new type
  const addType = () => {
    const newType: TypeFormItem = {
      tempId: Date.now().toString(),
      name: "",
      slug: "",
    };
    const newTypes = [...formData.types, newType];
    setFormData((prev) => ({
      ...prev,
      types: newTypes,
    }));
    setSubmitSuccess(false);
  };

  // Remove type
  const removeType = (tempId: string) => {
    const newTypes = formData.types.filter((type) => type.tempId !== tempId);
    setFormData((prev) => ({
      ...prev,
      types: newTypes,
    }));
    validateField("types", newTypes);
    setSubmitSuccess(false);
  };

  // Update type
  const updateType = (tempId: string, name: string) => {
    const newTypes = formData.types.map((type) => (type.tempId === tempId ? { ...type, name, slug: generateSlug(name) } : type));
    setFormData((prev) => ({
      ...prev,
      types: newTypes,
    }));

    // Validate the specific type
    try {
      const updatedType = newTypes.find((t) => t.tempId === tempId);
      if (updatedType) {
        const { tempId: _, ...typeForValidation } = updatedType;
        TypeSchema.parse(typeForValidation);
        // Clear type-specific errors
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[`type-${tempId}`];
          return newErrors;
        });
      }
    } catch (error: any) {
      if (error.errors) {
        setErrors((prev) => ({
          ...prev,
          [`type-${tempId}`]: error.errors.map((e: any) => e.message),
        }));
      }
    }

    validateField("types", newTypes);
    setSubmitSuccess(false);
  };

  // Validate entire form
  const validateForm = () => {
    if (!formData.icon) {
      setErrors((prev) => ({
        ...prev,
        icon: ["Icon file is required"],
      }));
      return false;
    }

    try {
      // Convert types to validation format (remove tempId)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const typesForValidation = formData.types.map(({ tempId, ...type }) => type);

      CategoryFormSchema.parse({
        ...formData,
        icon: formData.icon,
        types: typesForValidation,
      });
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: FormErrors = {};

      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field]!.push(err.message);
        });
      }

      setErrors(fieldErrors);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Prepare data for logging (excluding File object and tempId for cleaner output)

    const submissionData: SubmissionData = {
      name: formData.name,
      slug: formData.slug,
      section: formData.section,
      icon: formData.icon!,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      types: formData.types.map(({ tempId, ...type }) => type), // Remove tempId from submission
    };

    // console.log("formData: ", formData);
    console.log("submissionData: ", submissionData);

    await addNewCategory(submissionData);

    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 3000);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      section: "",
      icon: null,
      types: [],
    });
    setErrors({});
    setSubmitSuccess(false);

    // Reset file input
    const fileInput = document.getElementById("icon-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <Card>
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
          <CardDescription>Add a new category with its associated types</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {submitSuccess && (
              <Alert className='border-green-200 bg-green-50'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                <AlertDescription className='text-green-800'>Category created successfully! Check the console for form data.</AlertDescription>
              </Alert>
            )}

            {/* Category Name */}
            <div className='space-y-2'>
              <Label htmlFor='category-name'>Category Name</Label>
              <Input
                id='category-name'
                type='text'
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder='Enter category name'
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <div className='text-sm text-destructive'>
                  {errors.name.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
              {formData.slug && (
                <p className='text-sm text-muted-foreground'>
                  Slug: <code className='bg-muted px-1 py-0.5 rounded'>{formData.slug}</code>
                </p>
              )}
            </div>

            {/* Section Dropdown */}
            <div className='space-y-2'>
              <Label htmlFor='section'>Section</Label>
              <Select value={formData.section} onValueChange={handleSectionChange}>
                <SelectTrigger className={errors.section ? "border-destructive" : ""}>
                  <SelectValue placeholder='Select a section' />
                </SelectTrigger>
                <SelectContent>
                  {SECTION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.section && (
                <div className='text-sm text-destructive'>
                  {errors.section.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Icon Upload */}
            <div className='space-y-2'>
              <Label htmlFor='icon-upload'>Category Icon</Label>
              <div className='flex items-center gap-4'>
                <div className='flex-1'>
                  <Input id='icon-upload' type='file' accept='image/*' onChange={handleIconUpload} className={`cursor-pointer ${errors.icon ? "border-destructive" : ""}`} />
                </div>
                {formData.icon && (
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <FileImage className='h-4 w-4' />
                    <span className='truncate max-w-32'>{formData.icon.name}</span>
                    <span className='text-xs'>({Math.round(formData.icon.size / 1024)}KB)</span>
                  </div>
                )}
              </div>
              {errors.icon && (
                <div className='text-sm text-destructive'>
                  {errors.icon.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Types Section */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label className='text-base'>Types</Label>
                  <p className='text-sm text-muted-foreground'>Add types that belong to this category</p>
                </div>
                <Button type='button' variant='outline' size='sm' onClick={addType} className='flex items-center gap-2'>
                  <Plus className='h-4 w-4' />
                  Add Type
                </Button>
              </div>

              {errors.types && (
                <div className='text-sm text-destructive'>
                  {errors.types.map((error, index) => (
                    <p key={index}>{error}</p>
                  ))}
                </div>
              )}

              {formData.types.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg'>
                  <p>No types added yet</p>
                  <p className='text-sm'>Click "Add Type" to get started</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {formData.types.map((type, index) => (
                    <div key={type.tempId} className='flex items-center gap-3 p-3 border rounded-lg bg-muted/30'>
                      <div className='flex-1 space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Badge variant='secondary' className='text-xs'>
                            Type {index + 1}
                          </Badge>
                        </div>
                        <Input
                          type='text'
                          value={type.name}
                          onChange={(e) => updateType(type.tempId, e.target.value)}
                          placeholder='Enter type name'
                          className={errors[`type-${type.tempId}`] ? "border-destructive" : ""}
                        />
                        {errors[`type-${type.tempId}`] && (
                          <div className='text-sm text-destructive'>
                            {errors[`type-${type.tempId}`]!.map((error, errorIndex) => (
                              <p key={errorIndex}>{error}</p>
                            ))}
                          </div>
                        )}
                        {type.slug && (
                          <p className='text-xs text-muted-foreground'>
                            Slug: <code className='bg-muted px-1 py-0.5 rounded'>{type.slug}</code>
                          </p>
                        )}
                      </div>
                      <Button type='button' variant='ghost' size='sm' onClick={() => removeType(type.tempId)} className='text-destructive hover:text-destructive'>
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Form Summary */}
            {formData.name && formData.section && formData.icon && formData.types.length > 0 && (
              <div className='bg-muted/50 p-4 rounded-lg'>
                <h4 className='font-medium mb-2'>Form Summary</h4>
                <div className='text-sm space-y-1'>
                  <p>
                    <span className='font-medium'>Category:</span> {formData.name}
                  </p>
                  <p>
                    <span className='font-medium'>Icon:</span> {formData.icon.name}
                  </p>
                  <p>
                    <span className='font-medium'>Section:</span> {formData.section}
                  </p>
                  <p>
                    <span className='font-medium'>Types:</span> {formData.types.filter((t) => t.name.trim()).length} type(s)
                  </p>
                  <div className='mt-2'>
                    <span className='font-medium'>Type names:</span>
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {formData.types
                        .filter((t) => t.name.trim())
                        .map((type) => (
                          <Badge key={type.tempId} variant='outline' className='text-xs'>
                            {type.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className='flex justify-end gap-3'>
              <Button type='button' variant='outline' onClick={resetForm}>
                Reset
              </Button>
              <Button type='submit' disabled={isSubmitting || !formData.name || !formData.section || !formData.icon}>
                {isSubmitting ? "Processing..." : "Create Category"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
