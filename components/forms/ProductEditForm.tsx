"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Plus, Search, Trash, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Image from "next/image";
import addNewProduct from "@/app/actions/addProduct";
import { toast } from "react-toastify";
import { ProductType } from "@/models/Product";

// Define the stock item schema
const stockItemSchema = z.object({
  size: z.string().min(1, { message: "Size is required" }),
  quantity: z.coerce.number().int().nonnegative({ message: "Quantity must be a non-negative integer" }),
});

// Define the specification item schema
const specificationSchema = z.object({
  name: z.string().min(1, { message: "Specification name is required" }),
  description: z.string().min(1, { message: "Specification description is required" }),
});

// Update the form schema to use an array of stock items and specifications
const formSchema = z.object({
  brand: z.string().min(1, { message: "Brand is required" }),
  productModel: z.string().min(1, { message: "Model is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  season: z.string().min(1, { message: "Season is required" }),
  wholesalePrice: z.coerce.number().positive({ message: "Wholesale price must be positive" }),
  retailPrice: z.coerce.number().positive({ message: "Retail price must be positive" }),
  stockItems: z.array(stockItemSchema).min(1, { message: "At least one size and quantity is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  specifications: z.array(specificationSchema),
});

// Type for the form values
type FormValues = z.infer<typeof formSchema>;

// Custom searchable select component
function SearchableSelect({
  options,
  placeholder,
  value,
  onChange,
  displayKey = "name",
  valueKey = "_id",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any[];
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  displayKey?: string;
  valueKey?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((option) => option[displayKey].toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <div className='flex items-center border-b px-3 py-2'>
          <Search className='h-4 w-4 mr-2 opacity-50' />
          <input
            className='flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
            placeholder='Search...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        <div className={cn("max-h-[200px] overflow-y-auto", filteredOptions.length === 0 && "py-6 text-center text-sm")}>
          {filteredOptions.length === 0 ? (
            <p className='text-muted-foreground'>No results found</p>
          ) : (
            filteredOptions.map((option) => (
              <SelectItem key={option[valueKey]} value={option[valueKey]}>
                {option[displayKey]}
              </SelectItem>
            ))
          )}
        </div>
      </SelectContent>
    </Select>
  );
}

// Custom component for size input with dropdown or new size entry
function SizeInput({
  value,
  onChange,
  existingSizes = [],
  placeholder = "Select or enter size",
}: {
  value: string;
  onChange: (value: string) => void;
  existingSizes?: string[];
  placeholder?: string;
}) {
  const [isCustomSize, setIsCustomSize] = useState(false);
  const [customSize, setCustomSize] = useState("");

  // Check if the current value is in the existing sizes
  useEffect(() => {
    if (value && !existingSizes.includes(value)) {
      setIsCustomSize(true);
      setCustomSize(value);
    } else {
      setIsCustomSize(false);
    }
  }, [value, existingSizes]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "custom") {
      setIsCustomSize(true);
      setCustomSize("");
      onChange("");
    } else {
      setIsCustomSize(false);
      onChange(selectedValue);
    }
  };

  const handleCustomSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomSize(newValue);
    onChange(newValue);
  };

  return (
    <div className='w-full'>
      {!isCustomSize ? (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {existingSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
            <SelectItem value='custom'>+ Add new size</SelectItem>
          </SelectContent>
        </Select>
      ) : (
        <div className='flex items-center space-x-2'>
          <Input value={customSize} onChange={handleCustomSizeChange} placeholder='Enter size (e.g., S, M, L, 42, 10.5)' className='flex-1' />
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => {
              setIsCustomSize(false);
              onChange("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}

interface ProductFormProps {
  brands: { _id: string; name: string }[];
  types: { _id: string; name: string }[];
  categories: { _id: string; name: string }[];
  editProduct: ProductType | null
}

export default function ProductForm({ brands, types, categories, editProduct = null }: ProductFormProps) {

  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");
  const [availableSizes, setAvailableSizes] = useState<string[]>(["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "44"]);

  if(!editProduct) throw new Error('Error recieving the product info')



  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: editProduct.brand ||  "",
      productModel: editProduct.productModel ||   "",
      title: editProduct.title ||   "",
      category: editProduct.identifiers.category ||   "",
      type: editProduct.identifiers.categoryType ||   "",
      season: editProduct.season ||   "",
      wholesalePrice: editProduct.wholesalePrice ||   undefined,
      retailPrice: editProduct.retailPrice ||   undefined,
      stockItems: [{ size: "", quantity: 0 }],
      description: editProduct.description ||   "",
      specifications: editProduct.specifications ||   [{ name: "", description: "" }],
    },
  });

  // Use fieldArray to handle the dynamic stock items
  const {
    fields: stockFields,
    append: appendStock,
    remove: removeStock,
  } = useFieldArray({
    control: form.control,
    name: "stockItems",
  });

  // Use fieldArray to handle the dynamic specifications
  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  function onSubmit(values: FormValues) {
    if (images.length === 0) {
      setImageError("At least one image is required");
      return;
    }

    // Here you would typically send the form data to your API
    // Find the full objects for the selected IDs
    const selectedBrand = brands.find((b) => b._id === values.brand);
    const selectedCategory = categories.find((c) => c._id === values.category);
    const selectedType = types.find((t) => t._id === values.type);

    const formData = {
      ...values,
      brand: selectedBrand?._id,
      category: selectedCategory?._id,
      type: selectedType?._id,
      identifiers: { brand: selectedBrand?.name, categoryType: selectedType?.name, category: selectedCategory?.name },
      images,
    };

    const status = addNewProduct(formData);
    console.log('formData: ', formData);
    if (!status) toast.error('Something went wrong')
    toast.success("Product created successfully!");
    // redirect('/dashboard/inventory')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Update available sizes when a new custom size is added
  const updateAvailableSizes = () => {
    const currentSizes = form
      .getValues()
      .stockItems.map((item) => item.size)
      .filter(Boolean);
    const newSizes = currentSizes.filter((size) => !availableSizes.includes(size));

    if (newSizes.length > 0) {
      setAvailableSizes((prev) => [...prev, ...newSizes]);
    }
  };

  const seasons = ["All seasons", "Summer", "Winter", "Spring/Fall"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        {/* Row 1: Brand and Model */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='brand'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <SearchableSelect options={brands} placeholder='Select brand' value={ field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='productModel'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Input placeholder='Enter model' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Title */}
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder='Enter product title' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 3: Category and Type */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <SearchableSelect options={categories} placeholder='Select category' value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <SearchableSelect options={types} placeholder='Select type' value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4: Season */}
        <FormField
          control={form.control}
          name='season'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Season</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select season' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {seasons.map((season) => (
                    <SelectItem key={season} value={season}>
                      {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 5: Wholesale Price and Retail Price */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='wholesalePrice'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wholesale Price</FormLabel>
                <FormControl>
                  <Input type='number' step='0.01' placeholder='0.00' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='retailPrice'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Retail Price</FormLabel>
                <FormControl>
                  <Input type='number' step='0.01' placeholder='0.00' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 6: Stock Items */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Stock by Size</h3>
            {form.formState.errors.stockItems?.message && <p className='text-sm font-medium text-destructive'>{form.formState.errors.stockItems?.message}</p>}
          </div>

          {stockFields.map((field, index) => (
            <div key={field.id} className='flex items-start space-x-2'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 flex-1'>
                <FormField
                  control={form.control}
                  name={`stockItems.${index}.size`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SizeInput
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            updateAvailableSizes();
                          }}
                          existingSizes={availableSizes}
                          placeholder='Select or enter size'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`stockItems.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type='number' placeholder='Quantity' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {stockFields.length > 1 && (
                <Button type='button' variant='outline' size='icon' onClick={() => removeStock(index)} className='mt-0.5'>
                  <Trash className='h-4 w-4' />
                  <span className='sr-only'>Remove size</span>
                </Button>
              )}
            </div>
          ))}

          <Button type='button' variant='outline' size='sm' className='mt-2' onClick={() => appendStock({ size: "", quantity: 0 })}>
            <Plus className='h-4 w-4 mr-2' />
            Add Size
          </Button>
        </div>

        {/* Row 7: Description */}
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='Enter product description' rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row 8: Specifications */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Product Specifications</h3>
            {form.formState.errors.specifications?.message && <p className='text-sm font-medium text-destructive'>{form.formState.errors.specifications?.message}</p>}
          </div>

          {specFields.map((field, index) => (
            <div key={field.id} className='flex items-start space-x-2'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 flex-1'>
                <FormField
                  control={form.control}
                  name={`specifications.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder='Specification name' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`specifications.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder='Specification value' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type='button' variant='outline' size='icon' onClick={() => removeSpec(index)} className='mt-0.5'>
                <Trash className='h-4 w-4' />
                <span className='sr-only'>Remove specification</span>
              </Button>
            </div>
          ))}

          <Button type='button' variant='outline' size='sm' className='mt-2' onClick={() => appendSpec({ name: "", description: "" })}>
            <Plus className='h-4 w-4 mr-2' />
            Add Specification
          </Button>
        </div>

        {/* Row 9: Image Upload */}
        <div className='space-y-2 parent'>
          <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Product Images</label>
          <div
            className='border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors'
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <Upload className='h-10 w-10 mx-auto mb-2 text-muted-foreground' />
            <p className='text-sm text-muted-foreground mb-1'>Drag and drop your images here or click to browse</p>
            <p className='text-xs text-muted-foreground'>PNG, JPG, WEBP up to 10MB</p>
            <input id='image-upload' type='file' accept='image/*' multiple className='hidden' onChange={handleImageUpload} />
          </div>
          {imageError && <p className='text-sm font-medium text-destructive'>{imageError}</p>}

          {/* Preview uploaded images */}
          {images.length > 0 && (
            <div className='mt-4'>
              <p className='text-sm font-medium mb-2'>Uploaded Images ({images.length})</p>
              <div className='grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2 w-full'>
                {images.map((image, index) => (
                  <div key={index} className='relative group w-[100px]'>
                    <div className='aspect-square rounded-md overflow-hidden border'>
                      <Image
                        width={110}
                        height={110}
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Product image ${index + 1}`}
                        className='w-full h-full object-cover'
                      />
                    </div>
                    <button
                      type='button'
                      onClick={() => removeImage(index)}
                      className='absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X className='h-4 w-4' />
                      <span className='sr-only'>Remove image</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Button type='submit' className='w-full md:w-auto'>
          Create Product
        </Button>
      </form>
    </Form>
  );
}
