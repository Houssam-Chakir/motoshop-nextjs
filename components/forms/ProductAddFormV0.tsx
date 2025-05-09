"use client";

import type React from "react";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  brand: z.string().min(1, { message: "Brand is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  title: z.string().min(1, { message: "Title is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  season: z.string().min(1, { message: "Season is required" }),
  wholesalePrice: z.coerce.number().positive({ message: "Wholesale price must be positive" }),
  retailPrice: z.coerce.number().positive({ message: "Retail price must be positive" }),
  stock: z.coerce.number().int().nonnegative({ message: "Stock must be a non-negative integer" }),
  description: z.string().min(1, { message: "Description is required" }),
});

export function ProductAddForm() {
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: "",
      model: "",
      title: "",
      category: "",
      type: "",
      season: "",
      wholesalePrice: undefined,
      retailPrice: undefined,
      stock: undefined,
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (images.length === 0) {
      setImageError("At least one image is required");
      return;
    }
    console.log('values: ', {...values});


    alert("Product created successfully!");
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

  // Sample data for dropdowns
  const brands = [
    { _id: "1", name: "Nike" },
    { _id: "2", name: "Adidas" },
    { _id: "3", name: "Puma" },
    { _id: "4", name: "Under Armour" },
    { _id: "5", name: "New Balance" },
  ];

  const categories = [
    { _id: "1", name: "Footwear" },
    { _id: "2", name: "Apparel" },
    { _id: "3", name: "Accessories" },
    { _id: "4", name: "Equipment" },
  ];

  const types = [
    { _id: "1", name: "Running" },
    { _id: "2", name: "Basketball" },
    { _id: "3", name: "Soccer" },
    { _id: "4", name: "Training" },
    { _id: "5", name: "Casual" },
    { _id: "6", name: "Outdoor" },
  ];
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select brand' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='model'
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {types.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

        {/* Row 6: Stock */}
        <FormField
          control={form.control}
          name='stock'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input type='number' placeholder='0' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* Row 8: Image Upload */}
        <div className='space-y-2'>
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
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
                {images.map((image, index) => (
                  <div key={index} className='relative group'>
                    <div className='aspect-square rounded-md overflow-hidden border'>
                      <img src={URL.createObjectURL(image) || "/placeholder.svg"} alt={`Product image ${index + 1}`} className='w-full h-full object-cover' />
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
