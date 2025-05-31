"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import { toast } from "react-toastify";
import type { ProductType } from "@/models/Product";
import updateProduct from "@/app/actions/updateProduct";
import { redirect } from "next/navigation";
import mongoose from "mongoose";

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
  style: z.string().min(1, { message: "Style is required" }),
  wholesalePrice: z.string().refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
    message: "Wholesale price must be positive",
  }),
  retailPrice: z.string().refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
    message: "Retail price must be positive",
  }),
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
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((option) => option[displayKey].toLowerCase().includes(searchQuery.toLowerCase()));

  // Find the selected option
  const selectedOption = options.find((option) => option[valueKey] === value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Keep the dropdown open while typing
    setIsOpen(true);
  };

  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
    // Reset search when opening
    if (!isOpen) {
      setSearchQuery("");
      // Focus the input after a short delay to ensure the dropdown is open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  // Handle clicks outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className='relative w-full' ref={containerRef}>
      {/* Custom trigger button */}
      <button
        type='button'
        onClick={handleTriggerClick}
        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
      >
        <span className='flex-1 text-left truncate'>{selectedOption ? selectedOption[displayKey] : placeholder}</span>
        <span className='ml-2'>
          {isOpen ? (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-4 w-4 opacity-50'
            >
              <path d='m18 15-6-6-6 6' />
            </svg>
          ) : (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-4 w-4 opacity-50'
            >
              <path d='m6 9 6 6 6-6' />
            </svg>
          )}
        </span>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className='absolute z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95'>
          <div className='flex items-center border-b px-3 py-2'>
            <Search className='h-4 w-4 mr-2 opacity-50' />
            <input
              ref={inputRef}
              className='flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50'
              placeholder='Search...'
              value={searchQuery}
              onChange={handleInputChange}
              autoFocus
            />
          </div>
          <div className={cn("max-h-[200px] overflow-y-auto", filteredOptions.length === 0 && "py-6 text-center text-sm")}>
            {filteredOptions.length === 0 ? (
              <p className='text-muted-foreground p-2'>No results found</p>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option[valueKey]}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    option[valueKey] === value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleOptionSelect(option[valueKey])}
                >
                  {option[valueKey] === value && (
                    <span className='absolute left-2 flex h-3.5 w-3.5 items-center justify-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='h-4 w-4'
                      >
                        <polyline points='20 6 9 17 4 12' />
                      </svg>
                    </span>
                  )}
                  {option[displayKey]}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
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
  const [isEditing, setIsEditing] = useState(false);

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
      setIsEditing(true);
    } else {
      setIsCustomSize(false);
      onChange(selectedValue);
    }
  };

  const handleCustomSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomSize(newValue);
  };

  const handleCustomSizeBlur = () => {
    setIsEditing(false);
    if (customSize.trim()) {
      onChange(customSize.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setIsEditing(false);
      if (customSize.trim()) {
        onChange(customSize.trim());
      }
    }
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
          <Input
            value={customSize}
            onChange={handleCustomSizeChange}
            onBlur={handleCustomSizeBlur}
            onKeyDown={handleKeyDown}
            autoFocus={isEditing}
            placeholder='Enter size (e.g., S, M, L, 42, 10.5)'
            className='flex-1'
          />
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

async function handleUpdateProduct(formData) {
  const res = await updateProduct(formData);
  console.log("res: ", res);
  if (res.status) {
    toast.success("Product edited successfully!");
    redirect(`/products/${res.slug}`);
  } else toast.error("Error editing product");
}

interface ProductFormProps {
  brands: { _id: string; name: string }[];
  types: { _id: string; name: string }[];
  categories: { _id: string; name: string }[];
  editProduct: ProductType & { _id: string };
  productStock?: { _id: string; sizes: { size: string; quantity: number }[] };
}

export interface images {
  secure_url: string;
  public_id: string;
}

export default function ProductEditForm({ brands, types, categories, editProduct, productStock }: ProductFormProps) {
  if (!editProduct) {
    throw new Error("Error recieving the product info");
  }
  if (!productStock) toast.warning("cant find any stock document related to this product!");
  console.log("productStock: ", productStock);

  const [images, setImages] = useState<images[]>(editProduct.images || []);
  const [imagesToDelete, setImagesToDelete] = useState<images[]>([]);
  const [imagesToUpload, setImagesToUpload] = useState<File[]>([]);

  const [imageError, setImageError] = useState("");
  const [availableSizes, setAvailableSizes] = useState<string[]>(["XXS", "XS", "S", "M", "L", "XL", "XXL"]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: editProduct.brand.toString() || "",
      productModel: editProduct.productModel || "",
      title: editProduct.title || "",
      category: editProduct.category.toString() || "",
      type: editProduct.type.toString() || "",
      season: editProduct.season || "",
      style: editProduct.style || "",
      wholesalePrice: editProduct.wholesalePrice.toString() || "",
      retailPrice: editProduct.retailPrice.toString() || "",
      stockItems: productStock?.sizes || [{ size: "", quantity: 0 }],
      description: editProduct.description || "",
      specifications: editProduct.specifications || [{ name: "", description: "" }],
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

    const productId = editProduct._id;

    const formData = {
      ...values,
      // productId and stockId to find both
      productId,
      stockId: productStock ? productStock._id : null,
      wholesalePrice: Number.parseFloat(values.wholesalePrice),
      retailPrice: Number.parseFloat(values.retailPrice),
      brand: selectedBrand?._id.toString(),
      category: selectedCategory?._id.toString(),
      type: selectedType?._id.toString(),
      identifiers: { brand: selectedBrand?.name, categoryType: selectedType?.name, category: selectedCategory?.name },
      images,
      imagesToDelete,
      imagesToUpload,
    };

    console.log("formData: ", formData);
    handleUpdateProduct(formData);
    // redirect('/dashboard/inventory')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError("");
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setImagesToUpload((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number, imageObj: images) => {
    // removes image url from images
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    // add image url to images to delete array
    setImagesToDelete((prev) => [...prev, imageObj]);
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
  const styles = ["None", "Versitile", "Racing", "Adventure", "Enduro", "Urban", "Touring"];

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
                  <SearchableSelect options={brands} placeholder='Select brand' value={field.value} onChange={field.onChange} />
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

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
          {/* Row 4: Style */}
          <FormField
            control={form.control}
            name='style'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Style</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a style' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {styles.map((style) => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 5: Wholesale Price and Retail Price */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='wholesalePrice'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wholesale Price</FormLabel>
                <FormControl>
                  <Input type='text' step='0.01' placeholder='0.00' {...field} onChange={(e) => field.onChange(e.target.value)} value={field.value} />
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
                  <Input type='text' step='0.01' placeholder='0.00' {...field} onChange={(e) => field.onChange(e.target.value)} value={field.value} />
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
                        <Input type='text' placeholder='Quantity' {...field} onChange={(e) => field.onChange(e.target.value)} value={field.value} />
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
          {(images.length > 0 || imagesToUpload.length > 0) && (
            <div className='mt-4'>
              <p className='text-sm font-medium mb-2'>Product Images ({images.length + imagesToUpload.length})</p>
              <div className='grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2 w-full'>
                {/* Existing Cloudinary images */}
                {images.map((image, index) => (
                  <div key={`cloud-${index}`} className='relative group w-[100px]'>
                    <div className='aspect-square rounded-md overflow-hidden border'>
                      <Image width={110} height={110} src={image.secure_url || "/placeholder.svg"} alt={`Product image ${index + 1}`} className='w-full h-full object-cover' />
                    </div>
                    <button
                      type='button'
                      onClick={() => removeImage(index, image)}
                      className='absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <X className='h-4 w-4' />
                      <span className='sr-only'>Remove image</span>
                    </button>
                  </div>
                ))}

                {/* Newly uploaded image files */}
                {imagesToUpload.map((file, index) => (
                  <div key={`file-${index}`} className='relative group w-[100px]'>
                    <div className='aspect-square rounded-md overflow-hidden border'>
                      <Image width={110} height={110} src={URL.createObjectURL(file) || "/placeholder.svg"} alt={`New image ${index + 1}`} className='w-full h-full object-cover' />
                    </div>
                    <button
                      type='button'
                      onClick={() => {
                        const newFiles = [...imagesToUpload];
                        newFiles.splice(index, 1);
                        setImagesToUpload(newFiles);
                      }}
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
