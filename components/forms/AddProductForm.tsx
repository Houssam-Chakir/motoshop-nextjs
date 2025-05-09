"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";

const formSchema = z.object({
  brand: z.string(),
  name_6875916227: z.string().min(1),
  title: z.string().min(1),
  category: z.string(),
  type: z.string(),
  season: z.string().optional(),
  stock: z.number().min(1),
  wholesalePrice: z.number().min(1),
  retailPrice: z.number().min(1),
  description: z.string(),
});

export default function AddProductForm({ brands, types, categories }: { brands: { _id: string; name: string }[], types: { _id: string; name: string }[], categories: { _id: string; name: string }[] }) {
  console.log("brands: ", brands);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("values: ", values);

      toast.success("Product created successfuly");
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 max-w-3xl mx-auto py-10'>
        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-6 w-full'>
            <FormField
              control={form.control}
              name='brand'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Ex: MT' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands &&
                        brands.map((brand: { _id: string; name: string }) => {
                          return (
                            <SelectItem key={brand._id} value={brand._id}>
                              {brand.name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>
                  <FormDescription>Select a brand or create a new one</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='col-span-6'>
            <FormField
              control={form.control}
              name='name_6875916227'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder='Ex: Stream II' type='' {...field} />
                  </FormControl>
                  <FormDescription>the product model</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder='Ex: MT Helmet Stream II Full face Matt Black ECS Certified.' type='text' {...field} />
              </FormControl>
              <FormDescription>The product title including all names needed to describe the product</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-6'>
            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Ex: Helmet' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    {categories &&
                        categories.map((category: { _id: string; name: string }) => {
                          return (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='col-span-6'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Ex: Full face' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {types &&
                        types.map((type: { _id: string; name: string }) => {
                          return (
                            <SelectItem key={type._id} value={type._id}>
                              {type.name}
                            </SelectItem>
                          );
                        })}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name='season'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Season</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Ex: Summer' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='All seasons'>m@example.com</SelectItem>
                  <SelectItem value='Summer'>Summer</SelectItem>
                  <SelectItem value='Winter'>Winter</SelectItem>
                  <SelectItem value='Spring/Fall'>Spring/Fall</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>What season is this product meant for</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-4'>
            <FormField
              control={form.control}
              name='stock'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input placeholder='at least 1' type='number' {...field} {...form.register("stock", { valueAsNumber: true })} defaultValue={1} />
                  </FormControl>
                  <FormDescription>How many items in stock for this product</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className='grid grid-cols-12 gap-4'>
          <div className='col-span-6'>
            <FormField
              control={form.control}
              name='wholesalePrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>wholesale price</FormLabel>
                  <FormControl>
                    <Input placeholder='in MAD' type='number' {...field} {...form.register("wholesalePrice", { valueAsNumber: true })} defaultValue={1} />
                  </FormControl>
                  <FormDescription>Price of which the product was bought</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='col-span-6'>
            <FormField
              control={form.control}
              name='retailPrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retail price</FormLabel>
                  <FormControl>
                    <Input placeholder='in MAD' type='number' {...field} {...form.register("retailPrice", { valueAsNumber: true })} defaultValue={1} />
                  </FormControl>
                  <FormDescription>Price to sell to clients</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='' className='resize-none' {...field} defaultValue={""} />
              </FormControl>
              <FormDescription>give detailed description about the product</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>Submit</Button>
      </form>
    </Form>
  );
}
